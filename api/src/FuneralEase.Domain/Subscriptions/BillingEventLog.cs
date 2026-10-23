using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Subscriptions;

/// <summary>
/// Idempotency log for billing provider webhook events.
/// One row per (Channel, ProviderEventId) — prevents double-processing retried webhooks.
/// </summary>
public class BillingEventLog
{
    public Guid Id { get; private set; }
    public string Channel { get; private set; } = string.Empty;
    /// <summary>Unique event ID supplied by the billing provider (e.g. Apple originalTransactionId, Paystack reference).</summary>
    public string ProviderEventId { get; private set; } = string.Empty;
    public string EventType { get; private set; } = string.Empty;
    public HouseholdId HouseholdId { get; private set; }
    public DateTimeOffset ProcessedAt { get; private set; }

    private BillingEventLog() { }

    public static BillingEventLog Record(string channel, string providerEventId, string eventType, HouseholdId householdId)
    {
        return new BillingEventLog
        {
            Id = Guid.NewGuid(),
            Channel = channel,
            ProviderEventId = providerEventId,
            EventType = eventType,
            HouseholdId = householdId,
            ProcessedAt = DateTimeOffset.UtcNow
        };
    }
}
