using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Queries.GetPaymentHistory;

public record PaymentHistoryEntryDto(Guid Id, decimal AmountPaid, DateOnly PaidForDate, DateTimeOffset RecordedAt);

public record GetPaymentHistoryQuery(PolicyId PolicyId, HouseholdId HouseholdId) : IRequest<List<PaymentHistoryEntryDto>>;

public class GetPaymentHistoryQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetPaymentHistoryQuery, List<PaymentHistoryEntryDto>>
{
    public async Task<List<PaymentHistoryEntryDto>> Handle(GetPaymentHistoryQuery request, CancellationToken cancellationToken)
    {
        return await db.PremiumPaymentRecords
            .AsNoTracking()
            .Where(r => r.PolicyId == request.PolicyId && r.HouseholdId == request.HouseholdId)
            .OrderByDescending(r => r.PaidForDate)
            .Select(r => new PaymentHistoryEntryDto(r.Id.Value, r.AmountPaid, r.PaidForDate, r.RecordedAt))
            .ToListAsync(cancellationToken);
    }
}
