using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Households;

/// <summary>
/// Records each successful referral conversion.
/// One row per new household that joined using a referral code.
/// Used to calculate the referral coefficient metric (new households per existing household).
/// </summary>
public class ReferralLog
{
    public Guid Id { get; private set; }
    public HouseholdId ReferrerHouseholdId { get; private set; }
    public HouseholdId NewHouseholdId { get; private set; }
    public string ReferralCode { get; private set; } = string.Empty;
    public DateTimeOffset ConvertedAt { get; private set; }

    private ReferralLog() { }

    public static ReferralLog Record(HouseholdId referrerHouseholdId, HouseholdId newHouseholdId, string referralCode)
    {
        return new ReferralLog
        {
            Id = Guid.NewGuid(),
            ReferrerHouseholdId = referrerHouseholdId,
            NewHouseholdId = newHouseholdId,
            ReferralCode = referralCode,
            ConvertedAt = DateTimeOffset.UtcNow
        };
    }
}
