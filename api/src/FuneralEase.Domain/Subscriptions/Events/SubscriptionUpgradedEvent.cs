using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Subscriptions.Events;

public record SubscriptionUpgradedEvent(SubscriptionId SubscriptionId, HouseholdId HouseholdId, SubscriptionTier OldTier, SubscriptionTier NewTier) : IDomainEvent;
