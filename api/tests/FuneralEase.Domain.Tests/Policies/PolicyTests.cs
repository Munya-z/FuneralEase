using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;
using FuneralEase.Domain.Policies.Events;
using Xunit;

namespace FuneralEase.Domain.Tests.Policies;

public class PolicyTests
{
    private static Policy CreatePolicy(int daysUntilDue = 30) =>
        Policy.Create(
            HouseholdId.New(),
            "Sanlam",
            "POL-001",
            250m,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(daysUntilDue)));

    [Fact]
    public void Create_WithValidInputs_ShouldHaveCurrentStatus()
    {
        var policy = CreatePolicy(30);

        Assert.Equal(LapseStatus.Current, policy.LapseStatus);
        Assert.Equal("Sanlam", policy.InsurerName);
        Assert.Equal(250m, policy.PremiumAmount);
    }

    [Fact]
    public void Create_WithZeroPremium_ShouldThrow()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            Policy.Create(HouseholdId.New(), "Sanlam", "POL-001", 0m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30))));
    }

    [Fact]
    public void Create_WithNullInsurer_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            Policy.Create(HouseholdId.New(), "", "POL-001", 100m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30))));
    }

    [Fact]
    public void MarkPremiumPaid_ShouldResetStatusToCurrentAndAdvanceDueDate()
    {
        var policy = CreatePolicy(-5); // overdue
        policy.Escalate(); // → Overdue

        var paidForDate = DateOnly.FromDateTime(DateTime.UtcNow);
        policy.MarkPremiumPaid(paidForDate);

        Assert.Equal(LapseStatus.Current, policy.LapseStatus);
        Assert.Equal(paidForDate.AddMonths(1), policy.NextDueDate);
    }

    [Fact]
    public void MarkPremiumPaid_ShouldRaisePremiumPaidEvent()
    {
        var policy = CreatePolicy(30);
        var paidForDate = DateOnly.FromDateTime(DateTime.UtcNow);

        policy.MarkPremiumPaid(paidForDate);

        Assert.Contains(policy.DomainEvents, e => e is PremiumPaidEvent);
    }

    [Theory]
    [InlineData(10, LapseStatus.Current)]
    [InlineData(5, LapseStatus.DueSoon)]
    [InlineData(-5, LapseStatus.Overdue)]
    [InlineData(-35, LapseStatus.Lapsed)]
    public void Escalate_ShouldSetCorrectStatusBasedOnDueDate(int daysOffset, LapseStatus expectedStatus)
    {
        var policy = Policy.Create(
            HouseholdId.New(), "Sanlam", "POL-001", 250m,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(daysOffset)));

        policy.Escalate();

        Assert.Equal(expectedStatus, policy.LapseStatus);
    }

    [Fact]
    public void Escalate_WhenStatusUnchanged_ShouldNotRaiseDomainEvent()
    {
        var policy = CreatePolicy(30); // Current, 30 days out

        policy.Escalate(); // Still Current

        Assert.DoesNotContain(policy.DomainEvents, e => e is PolicyLapsedEvent);
    }

    [Fact]
    public void Escalate_WhenBecomingLapsed_ShouldRaisePolicyLapsedEvent()
    {
        var policy = Policy.Create(
            HouseholdId.New(), "Sanlam", "POL-001", 250m,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-35)));

        policy.Escalate();

        Assert.Contains(policy.DomainEvents, e => e is PolicyLapsedEvent pe && pe.NewStatus == LapseStatus.Lapsed);
    }

    [Fact]
    public void AddBeneficiary_ShouldAddToList()
    {
        var policy = CreatePolicy();

        policy.AddBeneficiary("John Doe", "Son", 100m);

        Assert.Single(policy.Beneficiaries);
    }

    [Fact]
    public void AddBeneficiary_OverOneHundredPercent_ShouldThrow()
    {
        var policy = CreatePolicy();
        policy.AddBeneficiary("John Doe", "Son", 60m);

        Assert.Throws<InvalidOperationException>(() =>
            policy.AddBeneficiary("Jane Doe", "Daughter", 60m));
    }

    [Fact]
    public void AddDocument_ShouldAddToDocumentList()
    {
        var policy = CreatePolicy();

        policy.AddDocument("uploads/key.pdf", "policy.pdf", "application/pdf");

        Assert.Single(policy.Documents);
    }
}
