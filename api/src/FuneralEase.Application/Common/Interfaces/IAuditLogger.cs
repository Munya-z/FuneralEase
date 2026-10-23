using FuneralEase.Domain.Audit;

namespace FuneralEase.Application.Common.Interfaces;

public interface IAuditLogger
{
    Task LogAsync(
        string actor,
        string action,
        AuditCategory category,
        string subject,
        string? detail = null,
        CancellationToken cancellationToken = default);
}
