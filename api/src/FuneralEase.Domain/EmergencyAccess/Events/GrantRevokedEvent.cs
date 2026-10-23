using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.EmergencyAccess.Events;

public record GrantRevokedEvent(EmergencyAccessSessionId SessionId, AccessGrantId GrantId, UserId RevokedByUserId) : IDomainEvent;
