using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Queries.GetCoverageAnalysis;

public record CoverageAnalysisDto(
    int TotalPolicies,
    decimal TotalMonthlyPremium,
    decimal TotalEstimatedCover,
    decimal AverageFuneralCost,
    decimal EstimatedGap,
    bool HasCoverageGap,
    int ActivePoliciesCount,
    int LapsedPoliciesCount,
    Dictionary<string, int> PolicyStatusBreakdown);

public record GetCoverageAnalysisQuery(HouseholdId HouseholdId) : IRequest<CoverageAnalysisDto>;

public class GetCoverageAnalysisQueryHandler(IApplicationDbContext db) : IRequestHandler<GetCoverageAnalysisQuery, CoverageAnalysisDto>
{
    private const decimal AverageFuneralCostZar = 40_000m;

    public async Task<CoverageAnalysisDto> Handle(GetCoverageAnalysisQuery request, CancellationToken cancellationToken)
    {
        var policies = await db.Policies
            .Where(p => p.HouseholdId == request.HouseholdId)
            .ToListAsync(cancellationToken);

        var totalPolicies = policies.Count;
        var totalMonthlyPremium = policies.Sum(p => p.PremiumAmount);

        // Use CoverAmount if specified, otherwise fall back to premium * 120 (10-year rule of thumb)
        var totalEstimatedCover = policies.Sum(p => p.CoverAmount ?? p.PremiumAmount * 120m);

        var statusBreakdown = policies
            .GroupBy(p => p.LapseStatus.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var activePoliciesCount = policies.Count(p =>
            p.LapseStatus == LapseStatus.Current || p.LapseStatus == LapseStatus.DueSoon);

        var lapsedPoliciesCount = policies.Count(p => p.LapseStatus == LapseStatus.Lapsed);

        var estimatedGap = Math.Max(0m, AverageFuneralCostZar - totalEstimatedCover);
        var hasCoverageGap = estimatedGap > 0;

        return new CoverageAnalysisDto(
            TotalPolicies: totalPolicies,
            TotalMonthlyPremium: totalMonthlyPremium,
            TotalEstimatedCover: totalEstimatedCover,
            AverageFuneralCost: AverageFuneralCostZar,
            EstimatedGap: estimatedGap,
            HasCoverageGap: hasCoverageGap,
            ActivePoliciesCount: activePoliciesCount,
            LapsedPoliciesCount: lapsedPoliciesCount,
            PolicyStatusBreakdown: statusBreakdown);
    }
}
