using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Commands.OverrideSubscription;

public record OverrideSubscriptionCommand(
    HouseholdId HouseholdId,
    SubscriptionTier Tier,
    DateTimeOffset? ExpiresAt) : IRequest<OverrideSubscriptionResult>;

public record OverrideSubscriptionResult(
    Guid SubscriptionId,
    Guid HouseholdId,
    string Tier,
    DateTimeOffset? EntitlementExpiresAt);

public class OverrideSubscriptionCommandHandler(IApplicationDbContext db, IAuditLogger audit)
    : IRequestHandler<OverrideSubscriptionCommand, OverrideSubscriptionResult>
{
    public async Task<OverrideSubscriptionResult> Handle(OverrideSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException("Subscription", request.HouseholdId.Value);

        subscription.OverrideTier(request.Tier, request.ExpiresAt);
        await db.SaveChangesAsync(cancellationToken);

        await audit.LogAsync(
            actor: "admin",
            action: "SUBSCRIPTION_OVERRIDDEN",
            category: AuditCategory.Billing,
            subject: $"Household:{request.HouseholdId.Value}",
            detail: $"Tier set to {request.Tier}; expires {request.ExpiresAt?.ToString("O") ?? "n/a"}",
            cancellationToken: cancellationToken);

        return new OverrideSubscriptionResult(
            subscription.Id.Value,
            subscription.HouseholdId.Value,
            subscription.Tier.ToString(),
            subscription.EntitlementExpiresAt);
    }
}
