using FuneralEase.Domain.Common;
using FuneralEase.Domain.EmergencyAccess.Events;

namespace FuneralEase.Domain.EmergencyAccess;

public class EmergencyAccessSession : AggregateRoot<EmergencyAccessSessionId>
{
    private readonly List<EmergencyContact> _contacts = [];
    private readonly List<AccessGrant> _grants = [];
    private readonly List<AuditEntry> _auditEntries = [];

    public HouseholdId HouseholdId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyList<EmergencyContact> Contacts => _contacts.AsReadOnly();
    public IReadOnlyList<AccessGrant> Grants => _grants.AsReadOnly();
    public IReadOnlyList<AuditEntry> AuditEntries => _auditEntries.AsReadOnly();

    private EmergencyAccessSession() { }

    public static EmergencyAccessSession Create(HouseholdId householdId)
    {
        var sessionId = EmergencyAccessSessionId.New();
        return new EmergencyAccessSession
        {
            Id = sessionId,
            HouseholdId = householdId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void UpsertContacts(IEnumerable<(string fullName, string mobileNumber, string relationship, string? saIdNumber, AccessMode accessMode)> contacts)
    {
        _contacts.Clear();
        foreach (var (fullName, mobileNumber, relationship, saIdNumber, accessMode) in contacts)
            _contacts.Add(new EmergencyContact(Id, fullName, mobileNumber, relationship, saIdNumber, accessMode));

        UpdatedAt = DateTimeOffset.UtcNow;
        AppendAudit("ContactsUpdated", UserId.Empty, $"Updated {_contacts.Count} emergency contacts");
    }

    /// <summary>
    /// Requests access for a contact using their configured AccessMode to derive the activation delay.
    /// </summary>
    public AccessGrant RequestAccess(EmergencyContactId contactId, UserId requestedByUserId, TimeSpan grantDuration)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId)
            ?? throw new InvalidOperationException($"Contact {contactId} not found in this session.");

        return RequestAccess(contactId, requestedByUserId, contact.GetActivationDelay(), grantDuration);
    }

    public AccessGrant RequestAccess(EmergencyContactId contactId, UserId requestedByUserId, TimeSpan activationDelay, TimeSpan grantDuration)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId)
            ?? throw new InvalidOperationException($"Contact {contactId} not found in this session.");

        var activatesAt = DateTimeOffset.UtcNow.Add(activationDelay);
        var expiresAt = activatesAt.Add(grantDuration);

        var grant = new AccessGrant(Id, contactId, requestedByUserId, activatesAt, expiresAt);
        _grants.Add(grant);
        UpdatedAt = DateTimeOffset.UtcNow;

        AppendAudit("AccessRequested", requestedByUserId,
            $"Grant {grant.Id.Value} requested by {requestedByUserId.Value}, activates at {activatesAt:O}");

        RaiseDomainEvent(new GrantActivatedEvent(Id, grant.Id, contactId));

        return grant;
    }

    public void RevokeGrant(AccessGrantId grantId, UserId revokedByUserId)
    {
        var grant = _grants.FirstOrDefault(g => g.Id == grantId)
            ?? throw new InvalidOperationException($"Grant {grantId} not found.");

        grant.Revoke(revokedByUserId);
        UpdatedAt = DateTimeOffset.UtcNow;

        AppendAudit("AccessRevoked", revokedByUserId, $"Grant {grantId.Value} revoked");
        RaiseDomainEvent(new GrantRevokedEvent(Id, grantId, revokedByUserId));
    }

    private void AppendAudit(string action, UserId actorId, string? details = null)
    {
        _auditEntries.Add(new AuditEntry
        {
            Action = action,
            ActorId = actorId.Value,
            OccurredAt = DateTimeOffset.UtcNow,
            Details = details
        });
    }
}
