using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FuneralEase.Application.Subscriptions.Webhooks;

public class HandleWebhookCommandHandler(IApplicationDbContext db, ILogger<HandleWebhookCommandHandler> logger)
    : IRequestHandler<HandleWebhookCommand>
{
    public async Task Handle(HandleWebhookCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.HouseholdExternalRef, out var householdGuid))
        {
            logger.LogWarning("Received webhook with invalid HouseholdExternalRef: {Ref}", request.HouseholdExternalRef);
            return;
        }

        var householdId = new HouseholdId(householdGuid);
        var channelName = request.Channel.ToString();

        // Idempotency: skip if we've already processed this provider event
        if (request.ProviderEventId is not null)
        {
            var alreadyProcessed = await db.BillingEventLogs
                .AnyAsync(e => e.Channel == channelName && e.ProviderEventId == request.ProviderEventId, cancellationToken);

            if (alreadyProcessed)
            {
                logger.LogInformation("Skipping duplicate webhook {EventId} from {Channel}", request.ProviderEventId, channelName);
                return;
            }
        }

        var subscription = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == householdId, cancellationToken);

        if (subscription is null)
        {
            logger.LogWarning("Webhook for unknown household {HouseholdId}", householdId);
            return;
        }

        var billingEvent = new BillingProviderEvent(
            request.Channel,
            request.EventType,
            request.NewTier,
            request.EntitlementExpiresAt,
            request.RawPayload);

        subscription.ApplyEvent(billingEvent);

        // Record event log for future idempotency checks
        if (request.ProviderEventId is not null)
        {
            db.BillingEventLogs.Add(BillingEventLog.Record(channelName, request.ProviderEventId, request.EventType, householdId));
        }

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Applied {EventType} from {Channel} for household {HouseholdId}", request.EventType, request.Channel, householdId);
    }
}
