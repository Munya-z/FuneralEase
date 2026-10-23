using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Subscriptions;

public record BillingProviderEvent(
    BillingChannel Channel,
    string EventType,
    SubscriptionTier NewTier,
    DateTimeOffset EntitlementExpiresAt,
    string RawPayload);
