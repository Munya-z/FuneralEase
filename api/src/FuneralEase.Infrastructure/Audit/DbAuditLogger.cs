using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;

namespace FuneralEase.Infrastructure.Audit;

public class DbAuditLogger(IApplicationDbContext db) : IAuditLogger
{
    public async Task LogAsync(
        string actor,
        string action,
        AuditCategory category,
        string subject,
        string? detail = null,
        CancellationToken cancellationToken = default)
    {
        var entry = SystemAuditLog.Record(actor, action, category, subject, detail);
        db.SystemAuditLogs.Add(entry);
        await db.SaveChangesAsync(cancellationToken);
    }
}
