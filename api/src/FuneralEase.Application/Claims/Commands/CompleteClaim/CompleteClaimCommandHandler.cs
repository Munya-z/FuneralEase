using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Households;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Commands.CompleteClaim;

public class CompleteClaimCommandHandler(
    IApplicationDbContext db,
    IAuditLogger audit,
    INotificationService notifications)
    : IRequestHandler<CompleteClaimCommand>
{
    public async Task Handle(CompleteClaimCommand request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .Include(c => c.ChecklistItems)
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Claims.Claim), request.ClaimId);

        claim.Complete();
        await db.SaveChangesAsync(cancellationToken);

        await audit.LogAsync(
            actor: request.HouseholdId.Value.ToString(),
            action: "CLAIM_SUBMITTED",
            category: AuditCategory.Emergency,
            subject: $"household:{request.HouseholdId.Value} claim:{request.ClaimId.Value}",
            detail: $"Claim for deceased: {claim.DeceasedFullName}",
            cancellationToken: cancellationToken);

        // Notify the household administrator
        var household = await db.Households
            .AsNoTracking()
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken);

        if (household is not null)
        {
            var admin = household.Members.FirstOrDefault(m => m.Role == MemberRole.Administrator);
            if (admin is not null)
            {
                await notifications.SendClaimSubmittedAsync(new ClaimSubmittedNotification(
                    AdminMobileNumber: admin.MobileNumber,
                    HouseholdName: household.Name,
                    DeceasedFullName: claim.DeceasedFullName,
                    ClaimId: request.ClaimId.Value.ToString()),
                    cancellationToken);
            }
        }
    }
}
