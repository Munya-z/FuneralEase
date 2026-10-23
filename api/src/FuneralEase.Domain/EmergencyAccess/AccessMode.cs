namespace FuneralEase.Domain.EmergencyAccess;

/// <summary>
/// Controls whether an emergency contact can view vault contents immediately
/// or after a mandatory delay (24–48 hours) during which the household is notified.
/// </summary>
public enum AccessMode
{
    /// <summary>Access is granted as soon as the contact activates the grant link.</summary>
    Immediate,

    /// <summary>A 24-hour hold is applied; the household admin receives a notification and can revoke before it activates.</summary>
    Delayed
}
