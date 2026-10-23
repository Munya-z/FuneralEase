using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Subscriptions.Commands.UpgradeSubscription;

public record SubscriptionDto(
    Guid Id,
    Guid HouseholdId,
    string Tier,
    string Channel,
    DateTimeOffset? EntitlementExpiresAt,
    DateTimeOffset? TrialEndsAt,
    bool IsInTrial,
    bool IsActive);

public record UpgradeSubscriptionCommand(
    HouseholdId HouseholdId,
    SubscriptionTier NewTier) : IRequest<SubscriptionDto>;

public class UpgradeSubscriptionCommandHandler(IApplicationDbContext db, IAuditLogger audit)
    : IRequestHandler<UpgradeSubscriptionCommand, SubscriptionDto>
{
    public async Task<SubscriptionDto> Handle(UpgradeSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Subscription not found.");

        subscription.UpgradeTier(request.NewTier);
        await db.SaveChangesAsync(cancellationToken);

        await audit.LogAsync(
            actor: request.HouseholdId.Value.ToString(),
            action: "SUBSCRIPTION_UPGRADED",
            category: AuditCategory.Billing,
            subject: $"Household:{request.HouseholdId.Value}",
            detail: $"New tier: {request.NewTier}",
            cancellationToken: cancellationToken);

        return new SubscriptionDto(
            subscription.Id.Value,
            subscription.HouseholdId.Value,
            subscription.Tier.ToString(),
            subscription.Channel.ToString(),
            subscription.EntitlementExpiresAt,
            subscription.TrialEndsAt,
            subscription.IsInTrial,
            true);
    }
}
