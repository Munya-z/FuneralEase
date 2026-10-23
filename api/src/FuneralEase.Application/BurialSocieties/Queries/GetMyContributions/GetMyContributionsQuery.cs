using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.BurialSocieties.Queries.GetMyContributions;

public record MyContributionDto(string Period, decimal AmountPaid, DateTimeOffset RecordedAt, string? Note);

public record GetMyContributionsResult(
    Guid SocietyId,
    string SocietyName,
    Guid MemberId,
    string MemberName,
    decimal MonthlyContributionAmount,
    List<MyContributionDto> Contributions);

public record GetMyContributionsQuery(BurialSocietyId SocietyId, HouseholdId HouseholdId) : IRequest<GetMyContributionsResult?>;

public class GetMyContributionsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetMyContributionsQuery, GetMyContributionsResult?>
{
    public async Task<GetMyContributionsResult?> Handle(GetMyContributionsQuery request, CancellationToken cancellationToken)
    {
        var society = await db.BurialSocieties
            .AsNoTracking()
            .Include("_members")
            .Include("_contributions")
            .FirstOrDefaultAsync(s => s.Id == request.SocietyId, cancellationToken);

        if (society is null) return null;

        var member = society.Members.FirstOrDefault(m => m.HouseholdId == request.HouseholdId);
        if (member is null) return null;

        var contributions = society.Contributions
            .Where(c => c.MemberId == member.Id)
            .OrderByDescending(c => c.Period)
            .Select(c => new MyContributionDto(c.Period, c.AmountPaid, c.RecordedAt, c.Note))
            .ToList();

        return new GetMyContributionsResult(
            society.Id.Value,
            society.Name,
            member.Id.Value,
            member.FullName,
            society.MonthlyContributionAmount,
            contributions);
    }
}
