using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.EmergencyAccess.Events;

public record GrantActivatedEvent(EmergencyAccessSessionId SessionId, AccessGrantId GrantId, EmergencyContactId ContactId) : IDomainEvent;
