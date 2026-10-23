using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions.Events;

namespace FuneralEase.Domain.Subscriptions;

public class Subscription : AggregateRoot<SubscriptionId>
{
    private const int TrialDays = 14;

    public HouseholdId HouseholdId { get; private set; }
    public SubscriptionTier Tier { get; private set; }
    public BillingChannel Channel { get; private set; }
    public DateTimeOffset? EntitlementExpiresAt { get; private set; }
    /// <summary>Set on free-tier accounts; null once a paid subscription is applied.</summary>
    public DateTimeOffset? TrialEndsAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private Subscription() { }

    public bool IsInTrial => TrialEndsAt.HasValue && TrialEndsAt.Value > DateTimeOffset.UtcNow;

    public static Subscription CreateFree(HouseholdId householdId)
    {
        return new Subscription
        {
            Id = SubscriptionId.New(),
            HouseholdId = householdId,
            Tier = SubscriptionTier.Free,
            Channel = BillingChannel.None,
            EntitlementExpiresAt = null,
            TrialEndsAt = DateTimeOffset.UtcNow.AddDays(TrialDays),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void ApplyEvent(BillingProviderEvent billingEvent)
    {
        var previousTier = Tier;

        Tier = billingEvent.NewTier;
        Channel = billingEvent.Channel;
        EntitlementExpiresAt = billingEvent.EntitlementExpiresAt;
        // Paid subscription supersedes trial
        if (Tier != SubscriptionTier.Free) TrialEndsAt = null;
        UpdatedAt = DateTimeOffset.UtcNow;

        if (previousTier != Tier)
            RaiseDomainEvent(new SubscriptionUpgradedEvent(Id, HouseholdId, previousTier, Tier));
    }

    public bool IsEntitled(SubscriptionTier requiredTier)
    {
        if (Tier < requiredTier) return false;
        if (Tier == SubscriptionTier.Free) return true;
        // During trial, treat as Individual entitlement regardless of channel
        if (IsInTrial) return requiredTier <= SubscriptionTier.Individual;
        return EntitlementExpiresAt.HasValue && EntitlementExpiresAt.Value > DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Directly upgrades the tier (mock / internal — production upgrades come via billing webhook events).
    /// Sets a 30-day entitlement window.
    /// </summary>
    public void UpgradeTier(SubscriptionTier newTier)
    {
        if (newTier <= Tier)
            throw new InvalidOperationException("New tier must be higher than current tier.");

        var previousTier = Tier;
        Tier = newTier;
        Channel = BillingChannel.None; // set properly by payment provider in production
        EntitlementExpiresAt = DateTimeOffset.UtcNow.AddDays(30);
        TrialEndsAt = null; // upgrade supersedes trial
        UpdatedAt = DateTimeOffset.UtcNow;

        RaiseDomainEvent(new SubscriptionUpgradedEvent(Id, HouseholdId, previousTier, Tier));
    }

    /// <summary>
    /// Admin-only: force-sets the tier to any value (including downgrade).
    /// Sets a 30-day entitlement window regardless of billing provider.
    /// </summary>
    public void OverrideTier(SubscriptionTier newTier, DateTimeOffset? expiresAt = null)
    {
        var previousTier = Tier;
        Tier = newTier;
        Channel = BillingChannel.None;
        EntitlementExpiresAt = newTier == SubscriptionTier.Free ? null : (expiresAt ?? DateTimeOffset.UtcNow.AddDays(30));
        TrialEndsAt = newTier != SubscriptionTier.Free ? null : TrialEndsAt;
        UpdatedAt = DateTimeOffset.UtcNow;

        if (previousTier != newTier)
            RaiseDomainEvent(new SubscriptionUpgradedEvent(Id, HouseholdId, previousTier, newTier));
    }

    // Entitlement matrix
    public int MaxPolicies => Tier switch
    {
        SubscriptionTier.Free => 1,
        _ => int.MaxValue
    };

    public int MaxEmergencyContacts => Tier switch
    {
        SubscriptionTier.Free => 1,
        SubscriptionTier.Individual => 3,
        SubscriptionTier.Family => 5,
        _ => int.MaxValue
    };
}
