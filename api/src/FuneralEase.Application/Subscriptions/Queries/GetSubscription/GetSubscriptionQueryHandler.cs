using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Subscriptions.Queries.GetSubscription;

public class GetSubscriptionQueryHandler(IApplicationDbContext db) : IRequestHandler<GetSubscriptionQuery, SubscriptionDto>
{
    public async Task<SubscriptionDto> Handle(GetSubscriptionQuery request, CancellationToken cancellationToken)
    {
        var sub = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Subscription), request.HouseholdId);

        return new SubscriptionDto(
            sub.Id.Value,
            sub.HouseholdId.Value,
            sub.Tier.ToString(),
            sub.Channel.ToString(),
            sub.EntitlementExpiresAt,
            sub.TrialEndsAt,
            sub.IsInTrial,
            sub.IsEntitled(sub.Tier));
    }
}
