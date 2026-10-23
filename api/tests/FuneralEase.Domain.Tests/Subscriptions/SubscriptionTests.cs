using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using FuneralEase.Domain.Subscriptions.Events;
using Xunit;

namespace FuneralEase.Domain.Tests.Subscriptions;

public class SubscriptionTests
{
    [Fact]
    public void CreateFree_ShouldHaveFreeTier()
    {
        var sub = Subscription.CreateFree(HouseholdId.New());

        Assert.Equal(SubscriptionTier.Free, sub.Tier);
        Assert.Equal(BillingChannel.None, sub.Channel);
        Assert.Equal(1, sub.MaxPolicies);
        Assert.Equal(1, sub.MaxEmergencyContacts);
    }

    [Fact]
    public void ApplyEvent_ShouldUpgradeTier()
    {
        var sub = Subscription.CreateFree(HouseholdId.New());
        var ev = new BillingProviderEvent(BillingChannel.Paystack, "subscription.paid", SubscriptionTier.Family, DateTimeOffset.UtcNow.AddMonths(1), "{}");

        sub.ApplyEvent(ev);

        Assert.Equal(SubscriptionTier.Family, sub.Tier);
        Assert.Equal(BillingChannel.Paystack, sub.Channel);
        Assert.NotNull(sub.EntitlementExpiresAt);
    }

    [Fact]
    public void ApplyEvent_WithTierChange_ShouldRaiseUpgradedEvent()
    {
        var sub = Subscription.CreateFree(HouseholdId.New());
        var ev = new BillingProviderEvent(BillingChannel.AppStore, "purchase", SubscriptionTier.Individual, DateTimeOffset.UtcNow.AddMonths(1), "{}");

        sub.ApplyEvent(ev);

        Assert.Contains(sub.DomainEvents, e => e is SubscriptionUpgradedEvent ue && ue.NewTier == SubscriptionTier.Individual);
    }

    [Fact]
    public void ApplyEvent_WithNoTierChange_ShouldNotRaiseDomainEvent()
    {
        var sub = Subscription.CreateFree(HouseholdId.New());
        // Apply same tier
        var ev = new BillingProviderEvent(BillingChannel.None, "renew", SubscriptionTier.Free, DateTimeOffset.UtcNow.AddMonths(1), "{}");

        sub.ApplyEvent(ev);

        Assert.DoesNotContain(sub.DomainEvents, e => e is SubscriptionUpgradedEvent);
    }

    [Theory]
    [InlineData(SubscriptionTier.Individual, 3)]
    [InlineData(SubscriptionTier.Family, 5)]
    [InlineData(SubscriptionTier.BurialSociety, int.MaxValue)]
    public void MaxEmergencyContacts_ShouldVaryByTier(SubscriptionTier tier, int expectedMax)
    {
        var sub = Subscription.CreateFree(HouseholdId.New());
        var ev = new BillingProviderEvent(BillingChannel.Paystack, "purchase", tier, DateTimeOffset.UtcNow.AddMonths(1), "{}");
        sub.ApplyEvent(ev);

        Assert.Equal(expectedMax, sub.MaxEmergencyContacts);
    }
}
