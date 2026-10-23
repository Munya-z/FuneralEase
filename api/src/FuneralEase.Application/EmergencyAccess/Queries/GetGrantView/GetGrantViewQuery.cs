using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EmergencyAccess.Queries.GetGrantView;

public record GrantViewPolicyDto(
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    string NextDueDate,
    string LapseStatus,
    List<string> BeneficiaryNames);

public record GrantViewDto(
    Guid GrantId,
    string HouseholdName,
    DateTimeOffset ExpiresAt,
    List<GrantViewPolicyDto> Policies);

public record GetGrantViewQuery(AccessGrantId GrantId) : IRequest<GrantViewDto?>;

public class GetGrantViewQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetGrantViewQuery, GrantViewDto?>
{
    public async Task<GrantViewDto?> Handle(GetGrantViewQuery request, CancellationToken cancellationToken)
    {
        // Find the session containing this grant
        var session = await db.EmergencyAccessSessions
            .AsNoTracking()
            .Include(s => s.Grants)
            .FirstOrDefaultAsync(s => s.Grants.Any(g => g.Id == request.GrantId), cancellationToken);

        if (session is null) return null;

        var grant = session.Grants.FirstOrDefault(g => g.Id == request.GrantId);
        if (grant is null || !grant.IsActive) return null;

        // Load household info and policies
        var household = await db.Households
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == session.HouseholdId, cancellationToken);

        var policies = await db.Policies
            .AsNoTracking()
            .Where(p => p.HouseholdId == session.HouseholdId)
            .ToListAsync(cancellationToken);

        var policyDtos = policies.Select(p => new GrantViewPolicyDto(
            p.InsurerName,
            p.PolicyNumber,
            p.PremiumAmount,
            p.NextDueDate.ToString("yyyy-MM-dd"),
            p.LapseStatus.ToString(),
            p.Beneficiaries.Select(b => b.FullName).ToList()
        )).ToList();

        return new GrantViewDto(
            grant.Id.Value,
            household?.Name ?? "Unknown household",
            grant.ExpiresAt,
            policyDtos);
    }
}
