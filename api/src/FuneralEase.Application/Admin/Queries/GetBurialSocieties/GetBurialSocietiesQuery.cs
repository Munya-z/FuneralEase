using FuneralEase.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetBurialSocieties;

public record BurialSocietySummaryDto(
    Guid Id,
    string Name,
    string? RegistrationNumber,
    Guid AdminHouseholdId,
    decimal MonthlyContributionAmount,
    int MemberCount,
    DateTimeOffset CreatedAt);

public record GetBurialSocietiesResult(
    List<BurialSocietySummaryDto> Items,
    int TotalCount);

public record GetBurialSocietiesQuery(int Page = 1, int PageSize = 20) : IRequest<GetBurialSocietiesResult>;

public class GetBurialSocietiesQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetBurialSocietiesQuery, GetBurialSocietiesResult>
{
    public async Task<GetBurialSocietiesResult> Handle(GetBurialSocietiesQuery request, CancellationToken cancellationToken)
    {
        var totalCount = await db.BurialSocieties.CountAsync(cancellationToken);

        var societies = await db.BurialSocieties
            .AsNoTracking()
            .Include("_members")
            .OrderByDescending(s => s.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = societies.Select(s => new BurialSocietySummaryDto(
            s.Id.Value,
            s.Name,
            s.RegistrationNumber,
            s.AdminHouseholdId.Value,
            s.MonthlyContributionAmount,
            s.Members.Count,
            s.CreatedAt)).ToList();

        return new GetBurialSocietiesResult(items, totalCount);
    }
}
