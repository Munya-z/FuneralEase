using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Commands.UpdateChecklistItem;

public class UpdateChecklistItemCommandHandler(IApplicationDbContext db) : IRequestHandler<UpdateChecklistItemCommand>
{
    public async Task Handle(UpdateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .Include(c => c.ChecklistItems)
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Claims.Claim), request.ClaimId);

        claim.UpdateChecklistItem(request.ItemId, request.IsChecked);
        await db.SaveChangesAsync(cancellationToken);
    }
}
