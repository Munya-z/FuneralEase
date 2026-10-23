using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Policies;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Commands.MarkPremiumPaid;

public class MarkPremiumPaidCommandHandler(IApplicationDbContext db) : IRequestHandler<MarkPremiumPaidCommand>
{
    public async Task Handle(MarkPremiumPaidCommand request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Policy), request.PolicyId);

        policy.MarkPremiumPaid(request.PaidForDate);

        db.PremiumPaymentRecords.Add(PremiumPaymentRecord.Create(
            request.PolicyId,
            request.HouseholdId,
            policy.PremiumAmount,
            request.PaidForDate));

        await db.SaveChangesAsync(cancellationToken);
    }
}
