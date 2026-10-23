using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Subscriptions.Queries.GetSubscription;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FuneralEase.Application.Subscriptions.Commands.VerifyPayment;

public record VerifyPaymentCommand(
    HouseholdId HouseholdId,
    string Reference) : IRequest<SubscriptionDto>;

public class VerifyPaymentCommandHandler(
    IApplicationDbContext db,
    IBillingProvider billing,
    ILogger<VerifyPaymentCommandHandler> logger)
    : IRequestHandler<VerifyPaymentCommand, SubscriptionDto>
{
    public async Task<SubscriptionDto> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var subscription = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Subscription not found for this household.");

        var verified = await billing.VerifyTransactionAsync(request.Reference, cancellationToken);
        if (verified is null || !verified.Success)
            throw new InvalidOperationException("Payment has not been confirmed by Paystack yet.");

        if (!string.IsNullOrEmpty(verified.HouseholdId)
            && Guid.TryParse(verified.HouseholdId, out var paidHousehold)
            && paidHousehold != request.HouseholdId.Value)
        {
            throw new InvalidOperationException("This payment does not belong to your household.");
        }

        var tier = verified.Tier
            ?? throw new InvalidOperationException("Payment metadata is missing the subscription tier.");

        var channel = BillingChannel.Paystack.ToString();
        var alreadyProcessed = await db.BillingEventLogs
            .AnyAsync(e => e.Channel == channel && e.ProviderEventId == verified.ProviderEventId, cancellationToken);

        if (!alreadyProcessed && subscription.Tier != tier)
        {
            var expiresAt = DateTimeOffset.UtcNow.AddDays(31);
            subscription.ApplyEvent(new BillingProviderEvent(
                BillingChannel.Paystack,
                "transaction.verify",
                tier,
                expiresAt,
                request.Reference));

            db.BillingEventLogs.Add(
                BillingEventLog.Record(channel, verified.ProviderEventId, "transaction.verify", request.HouseholdId));

            await db.SaveChangesAsync(cancellationToken);
            logger.LogInformation(
                "Applied verified Paystack payment {Reference} for household {HouseholdId} → {Tier}",
                request.Reference, request.HouseholdId, tier);
        }

        return new SubscriptionDto(
            subscription.Id.Value,
            subscription.HouseholdId.Value,
            subscription.Tier.ToString(),
            subscription.Channel.ToString(),
            subscription.EntitlementExpiresAt,
            subscription.TrialEndsAt,
            subscription.IsInTrial,
            subscription.IsEntitled(subscription.Tier));
    }
}
