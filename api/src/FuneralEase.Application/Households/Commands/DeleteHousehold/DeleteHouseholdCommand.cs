using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Commands.DeleteHousehold;

public record DeleteHouseholdCommand(HouseholdId HouseholdId) : IRequest;

public class DeleteHouseholdCommandHandler(IApplicationDbContext db, IAuditLogger audit)
    : IRequestHandler<DeleteHouseholdCommand>
{
    public async Task Handle(DeleteHouseholdCommand request, CancellationToken cancellationToken)
    {
        var household = await db.Households
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Household not found.");

        household.Delete();
        await db.SaveChangesAsync(cancellationToken);

        await audit.LogAsync(
            actor: request.HouseholdId.Value.ToString(),
            action: "HOUSEHOLD_DELETED",
            category: AuditCategory.Popia,
            subject: $"Household:{request.HouseholdId.Value}",
            detail: "POPIA §17 — right to erasure exercised by account owner",
            cancellationToken: cancellationToken);
    }
}
