using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Commands.UpdateClaimStatus;

public record UpdateClaimStatusCommand(ClaimId ClaimId, ClaimStatus NewStatus) : IRequest;

public class UpdateClaimStatusCommandHandler(
    IApplicationDbContext db,
    IAuditLogger audit,
    INotificationService notifications)
    : IRequestHandler<UpdateClaimStatusCommand>
{
    public async Task Handle(UpdateClaimStatusCommand request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId, cancellationToken)
            ?? throw new NotFoundException(nameof(Claim), request.ClaimId);

        claim.UpdateStatus(request.NewStatus);
        await db.SaveChangesAsync(cancellationToken);

        await audit.LogAsync(
            actor: "admin",
            action: "CLAIM_STATUS_UPDATED",
            category: AuditCategory.Moderation,
            subject: $"claim:{request.ClaimId.Value} household:{claim.HouseholdId.Value}",
            detail: $"Status changed to {request.NewStatus} for deceased: {claim.DeceasedFullName}",
            cancellationToken: cancellationToken);

        // Notify household administrator
        var household = await db.Households
            .AsNoTracking()
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == claim.HouseholdId, cancellationToken);

        if (household is not null)
        {
            var admin = household.Members.FirstOrDefault(m => m.Role == MemberRole.Administrator);
            if (admin is not null)
            {
                await notifications.SendClaimStatusUpdatedAsync(new ClaimStatusUpdatedNotification(
                    AdminMobileNumber: admin.MobileNumber,
                    HouseholdName: household.Name,
                    DeceasedFullName: claim.DeceasedFullName,
                    NewStatus: request.NewStatus.ToString()),
                    cancellationToken);
            }
        }
    }
}
