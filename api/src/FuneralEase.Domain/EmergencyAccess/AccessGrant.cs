using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.EmergencyAccess;

public class AccessGrant : Entity<AccessGrantId>
{
    public EmergencyAccessSessionId SessionId { get; private set; }
    public EmergencyContactId ContactId { get; private set; }
    public UserId RequestedByUserId { get; private set; }
    public DateTimeOffset ActivatesAt { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public bool IsRevoked { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public UserId? RevokedByUserId { get; private set; }

    private AccessGrant() { }

    public AccessGrant(
        EmergencyAccessSessionId sessionId,
        EmergencyContactId contactId,
        UserId requestedByUserId,
        DateTimeOffset activatesAt,
        DateTimeOffset expiresAt)
        : base(AccessGrantId.New())
    {
        if (expiresAt <= activatesAt)
            throw new ArgumentException("ExpiresAt must be after ActivatesAt.");

        SessionId = sessionId;
        ContactId = contactId;
        RequestedByUserId = requestedByUserId;
        ActivatesAt = activatesAt;
        ExpiresAt = expiresAt;
        IsRevoked = false;
    }

    public bool IsActive =>
        !IsRevoked &&
        DateTimeOffset.UtcNow >= ActivatesAt &&
        DateTimeOffset.UtcNow < ExpiresAt;

    public void Revoke(UserId revokedByUserId)
    {
        if (IsRevoked)
            throw new InvalidOperationException("Grant is already revoked.");

        IsRevoked = true;
        RevokedAt = DateTimeOffset.UtcNow;
        RevokedByUserId = revokedByUserId;
    }
}
