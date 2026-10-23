using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetAdminBurialSocietyDetail;

public record AdminSocietyMemberDto(
    Guid MemberId,
    Guid HouseholdId,
    string FullName,
    string MobileNumber,
    DateTimeOffset JoinedAt,
    int ContributionCount,
    decimal TotalContributed);

public record AdminSocietyContributionDto(
    Guid Id,
    Guid MemberId,
    string MemberName,
    decimal AmountPaid,
    string Period,
    DateTimeOffset RecordedAt,
    string? Note);

public record AdminBurialSocietyDetailDto(
    Guid Id,
    string Name,
    string? RegistrationNumber,
    Guid AdminHouseholdId,
    decimal MonthlyContributionAmount,
    DateTimeOffset CreatedAt,
    List<AdminSocietyMemberDto> Members,
    List<AdminSocietyContributionDto> RecentContributions);

public record GetAdminBurialSocietyDetailQuery(BurialSocietyId Id) : IRequest<AdminBurialSocietyDetailDto?>;

public class GetAdminBurialSocietyDetailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetAdminBurialSocietyDetailQuery, AdminBurialSocietyDetailDto?>
{
    public async Task<AdminBurialSocietyDetailDto?> Handle(GetAdminBurialSocietyDetailQuery request, CancellationToken cancellationToken)
    {
        var society = await db.BurialSocieties
            .AsNoTracking()
            .Include("_members")
            .Include("_contributions")
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (society is null) return null;

        var members = society.Members.Select(m =>
        {
            var memberContribs = society.Contributions.Where(c => c.MemberId == m.Id).ToList();
            return new AdminSocietyMemberDto(
                m.Id.Value,
                m.HouseholdId.Value,
                m.FullName,
                m.MobileNumber,
                m.JoinedAt,
                memberContribs.Count,
                memberContribs.Sum(c => c.AmountPaid));
        }).OrderBy(m => m.FullName).ToList();

        var memberNameMap = society.Members.ToDictionary(m => m.Id, m => m.FullName);

        var recentContributions = society.Contributions
            .OrderByDescending(c => c.RecordedAt)
            .Take(50)
            .Select(c => new AdminSocietyContributionDto(
                c.Id.Value,
                c.MemberId.Value,
                memberNameMap.TryGetValue(c.MemberId, out var n) ? n : "Unknown",
                c.AmountPaid,
                c.Period,
                c.RecordedAt,
                c.Note))
            .ToList();

        return new AdminBurialSocietyDetailDto(
            society.Id.Value,
            society.Name,
            society.RegistrationNumber,
            society.AdminHouseholdId.Value,
            society.MonthlyContributionAmount,
            society.CreatedAt,
            members,
            recentContributions);
    }
}
