using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetBillingEvents;

public record GetBillingEventsQuery(int Page = 1, int PageSize = 50) : IRequest<GetBillingEventsResult>;

public record BillingEventDto(
    Guid Id,
    string Channel,
    string ProviderEventId,
    string EventType,
    Guid HouseholdId,
    DateTimeOffset ProcessedAt);

public record GetBillingEventsResult(List<BillingEventDto> Items, int TotalCount);

public class GetBillingEventsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetBillingEventsQuery, GetBillingEventsResult>
{
    public async Task<GetBillingEventsResult> Handle(GetBillingEventsQuery request, CancellationToken cancellationToken)
    {
        var total = await db.BillingEventLogs.CountAsync(cancellationToken);

        var items = await db.BillingEventLogs
            .AsNoTracking()
            .OrderByDescending(e => e.ProcessedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new BillingEventDto(
                e.Id,
                e.Channel,
                e.ProviderEventId,
                e.EventType,
                e.HouseholdId.Value,
                e.ProcessedAt))
            .ToListAsync(cancellationToken);

        return new GetBillingEventsResult(items, total);
    }
}
