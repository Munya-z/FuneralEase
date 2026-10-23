using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Parlours;
using FuneralEase.Domain.Policies;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetDashboard;

public record GetDashboardQuery : IRequest<DashboardDto>;

public record DashboardDto(
    int TotalHouseholds,
    int TotalPolicies,
    int ActiveSubscriptions,
    int PendingParlours,
    int OpenClaims,
    int LapsedPolicies,
    TierBreakdownDto TierBreakdown,
    decimal EstimatedMrr);

public record TierBreakdownDto(int Free, int Individual, int Family, int BurialSociety);

public class GetDashboardQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var householdCount = await db.Households.CountAsync(cancellationToken);
        var policyCount = await db.Policies.CountAsync(cancellationToken);
        var lapsedCount = await db.Policies.CountAsync(p => p.LapseStatus == LapseStatus.Lapsed, cancellationToken);
        var openClaimsCount = await db.Claims.CountAsync(c => c.Status == ClaimStatus.InProgress, cancellationToken);
        var pendingParloursCount = await db.Parlours.CountAsync(p => p.Status == ParlourStatus.PendingReview, cancellationToken);

        var tiers = await db.Subscriptions
            .AsNoTracking()
            .GroupBy(s => s.Tier)
            .Select(g => new { Tier = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        int Get(SubscriptionTier t) => tiers.FirstOrDefault(x => x.Tier == t)?.Count ?? 0;

        var breakdown = new TierBreakdownDto(
            Get(SubscriptionTier.Free),
            Get(SubscriptionTier.Individual),
            Get(SubscriptionTier.Family),
            Get(SubscriptionTier.BurialSociety));

        var mrr = breakdown.Individual * 9m + breakdown.Family * 29m + breakdown.BurialSociety * 99m;

        return new DashboardDto(
            householdCount,
            policyCount,
            tiers.Sum(t => t.Count),
            pendingParloursCount,
            openClaimsCount,
            lapsedCount,
            breakdown,
            mrr);
    }
}
