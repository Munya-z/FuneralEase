using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Policies;

/// <summary>
/// Immutable record of a single premium payment, written when a user marks a premium as paid.
/// Provides an auditable payment history per policy.
/// </summary>
public class PremiumPaymentRecord : Entity<PremiumPaymentRecordId>
{
    public PolicyId PolicyId { get; private set; }
    public HouseholdId HouseholdId { get; private set; }
    public decimal AmountPaid { get; private set; }
    public DateOnly PaidForDate { get; private set; }
    public DateTimeOffset RecordedAt { get; private set; }

    private PremiumPaymentRecord() { }

    public static PremiumPaymentRecord Create(
        PolicyId policyId,
        HouseholdId householdId,
        decimal amountPaid,
        DateOnly paidForDate) => new()
    {
        Id = PremiumPaymentRecordId.New(),
        PolicyId = policyId,
        HouseholdId = householdId,
        AmountPaid = amountPaid,
        PaidForDate = paidForDate,
        RecordedAt = DateTimeOffset.UtcNow
    };
}
