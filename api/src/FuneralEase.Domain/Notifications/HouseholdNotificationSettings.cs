using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Notifications;

/// <summary>
/// Stores per-household notification opt-in flags.
/// One row per household — upserted on first save.
/// </summary>
public class HouseholdNotificationSettings
{
    private HouseholdNotificationSettings() { } // EF

    public HouseholdId HouseholdId { get; private set; }

    public bool PremiumDue { get; private set; } = true;
    public bool PremiumOverdue { get; private set; } = true;
    public bool LapseWarning { get; private set; } = true;
    public bool ClaimUpdates { get; private set; } = true;
    public bool EmergencyAccess { get; private set; } = true;
    public bool ReferralJoins { get; private set; } = false;

    public DateTimeOffset UpdatedAt { get; private set; }

    public static HouseholdNotificationSettings CreateDefaults(HouseholdId householdId) =>
        new()
        {
            HouseholdId = householdId,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

    public void Update(
        bool premiumDue,
        bool premiumOverdue,
        bool lapseWarning,
        bool claimUpdates,
        bool emergencyAccess,
        bool referralJoins)
    {
        PremiumDue = premiumDue;
        PremiumOverdue = premiumOverdue;
        LapseWarning = lapseWarning;
        ClaimUpdates = claimUpdates;
        EmergencyAccess = emergencyAccess;
        ReferralJoins = referralJoins;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
