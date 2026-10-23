using FuneralEase.Domain.Subscriptions;
using MediatR;

namespace FuneralEase.Application.Subscriptions.Webhooks;

public record HandleWebhookCommand(
    BillingChannel Channel,
    string RawPayload,
    string EventType,
    string HouseholdExternalRef,
    SubscriptionTier NewTier,
    DateTimeOffset EntitlementExpiresAt,
    /// <summary>Provider-assigned unique event ID used for idempotency (e.g. Apple originalTransactionId, Paystack reference).</summary>
    string? ProviderEventId = null) : IRequest;
