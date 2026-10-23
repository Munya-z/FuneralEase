using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetAuditLog;

public record GetAuditLogQuery(int Page = 1, int PageSize = 50, AuditCategory? Category = null) : IRequest<GetAuditLogResult>;

public record AuditLogEntryDto(
    Guid Id,
    string Actor,
    string Action,
    string Category,
    string Subject,
    string? Detail,
    DateTimeOffset OccurredAt);

public record GetAuditLogResult(List<AuditLogEntryDto> Items, int TotalCount, int Page, int PageSize);

public class GetAuditLogQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetAuditLogQuery, GetAuditLogResult>
{
    public async Task<GetAuditLogResult> Handle(GetAuditLogQuery request, CancellationToken cancellationToken)
    {
        var query = db.SystemAuditLogs.AsNoTracking();

        if (request.Category.HasValue)
            query = query.Where(l => l.Category == request.Category.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(l => l.OccurredAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(l => new AuditLogEntryDto(
                l.Id.Value,
                l.Actor,
                l.Action,
                l.Category.ToString(),
                l.Subject,
                l.Detail,
                l.OccurredAt))
            .ToListAsync(cancellationToken);

        return new GetAuditLogResult(items, total, request.Page, request.PageSize);
    }
}
