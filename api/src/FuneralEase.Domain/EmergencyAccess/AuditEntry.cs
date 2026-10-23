namespace FuneralEase.Domain.EmergencyAccess;

public class AuditEntry
{
    public string Action { get; init; } = string.Empty;
    public Guid ActorId { get; init; }
    public DateTimeOffset OccurredAt { get; init; }
    public string? Details { get; init; }
}
