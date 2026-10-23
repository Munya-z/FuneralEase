using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.SearchHouseholds;

public record SearchHouseholdsQuery(string? Search, string? Tier, int Page = 1, int PageSize = 20)
    : IRequest<SearchHouseholdsResult>;

public record HouseholdSummaryDto(
    Guid HouseholdId,
    string Name,
    string ReferralCode,
    int MemberCount,
    int PolicyCount,
    string SubscriptionTier,
    DateTimeOffset CreatedAt);

public record SearchHouseholdsResult(List<HouseholdSummaryDto> Items, int TotalCount);

public class SearchHouseholdsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<SearchHouseholdsQuery, SearchHouseholdsResult>
{
    public async Task<SearchHouseholdsResult> Handle(SearchHouseholdsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Households.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(h => h.Name.Contains(request.Search) || h.ReferralCode == request.Search);

        var total = await query.CountAsync(cancellationToken);

        var households = await query
            .OrderByDescending(h => h.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var householdIds = households.Select(h => h.Id).ToList();

        var policyCountMap = await db.Policies
            .AsNoTracking()
            .Where(p => householdIds.Contains(p.HouseholdId))
            .GroupBy(p => p.HouseholdId)
            .Select(g => new { HouseholdId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.HouseholdId, x => x.Count, cancellationToken);

        var subscriptionMap = await db.Subscriptions
            .AsNoTracking()
            .Where(s => householdIds.Contains(s.HouseholdId))
            .ToDictionaryAsync(s => s.HouseholdId, s => s.Tier.ToString(), cancellationToken);

        var items = households.Select(h => new HouseholdSummaryDto(
            h.Id.Value,
            h.Name,
            h.ReferralCode,
            h.Members.Count,
            policyCountMap.GetValueOrDefault(h.Id, 0),
            subscriptionMap.GetValueOrDefault(h.Id, SubscriptionTier.Free.ToString()),
            h.CreatedAt)).ToList();

        return new SearchHouseholdsResult(items, total);
    }
}
