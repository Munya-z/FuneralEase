using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Audit;

/// <summary>
/// Immutable, append-only audit record written by command handlers for
/// staff actions, POPIA requests, and key system events.
/// </summary>
public class SystemAuditLog : Entity<SystemAuditLogId>
{
    public string Actor { get; private init; } = string.Empty;
    public string Action { get; private init; } = string.Empty;
    public AuditCategory Category { get; private init; }
    public string Subject { get; private init; } = string.Empty;
    public string? Detail { get; private init; }
    public DateTimeOffset OccurredAt { get; private init; }

    private SystemAuditLog() { }

    public static SystemAuditLog Record(
        string actor,
        string action,
        AuditCategory category,
        string subject,
        string? detail = null)
    {
        if (string.IsNullOrWhiteSpace(actor)) throw new ArgumentException("Actor required.", nameof(actor));
        if (string.IsNullOrWhiteSpace(action)) throw new ArgumentException("Action required.", nameof(action));
        if (string.IsNullOrWhiteSpace(subject)) throw new ArgumentException("Subject required.", nameof(subject));

        return new SystemAuditLog
        {
            Id = SystemAuditLogId.New(),
            Actor = actor,
            Action = action,
            Category = category,
            Subject = subject,
            Detail = detail,
            OccurredAt = DateTimeOffset.UtcNow
        };
    }
}

public enum AuditCategory
{
    Emergency,
    Moderation,
    Billing,
    Popia,
    Society,
    Auth
}
