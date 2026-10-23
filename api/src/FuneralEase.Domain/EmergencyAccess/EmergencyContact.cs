using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.EmergencyAccess;

public class EmergencyContact : Entity<EmergencyContactId>
{
    private static readonly TimeSpan DelayedActivationHold = TimeSpan.FromHours(24);

    public EmergencyAccessSessionId SessionId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string MobileNumber { get; private set; } = string.Empty;
    public string Relationship { get; private set; } = string.Empty;
    public string? SaIdNumber { get; private set; }   // encrypted at rest via EF ValueConverter
    /// <summary>Whether this contact receives immediate access or a 24-hour delayed hold.</summary>
    public AccessMode AccessMode { get; private set; } = AccessMode.Delayed;

    private EmergencyContact() { }

    public EmergencyContact(
        EmergencyAccessSessionId sessionId,
        string fullName,
        string mobileNumber,
        string relationship,
        string? saIdNumber = null,
        AccessMode accessMode = AccessMode.Delayed)
        : base(EmergencyContactId.New())
    {
        SessionId = sessionId;
        FullName = Guard.NotNullOrEmpty(fullName, nameof(fullName));
        MobileNumber = Guard.NotNullOrEmpty(mobileNumber, nameof(mobileNumber));
        Relationship = Guard.NotNullOrEmpty(relationship, nameof(relationship));
        SaIdNumber = saIdNumber;
        AccessMode = accessMode;
    }

    /// <summary>Returns the activation delay for a new grant based on this contact's access mode.</summary>
    public TimeSpan GetActivationDelay() =>
        AccessMode == AccessMode.Immediate ? TimeSpan.Zero : DelayedActivationHold;
}
