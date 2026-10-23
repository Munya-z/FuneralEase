using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Parlours.DTOs;
using FuneralEase.Domain.Audit;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Commands.ModerateParlour;

public class ModerateParlourCommandHandler(IApplicationDbContext db, IAuditLogger audit)
    : IRequestHandler<ModerateParlourCommand, ParlourDto>
{
    public async Task<ParlourDto> Handle(ModerateParlourCommand request, CancellationToken cancellationToken)
    {
        var parlour = await db.Parlours.FirstOrDefaultAsync(p => p.Id == request.ParlourId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Parlours.Parlour), request.ParlourId);

        if (request.Approve)
            parlour.Approve();
        else
            parlour.Reject(request.RejectionReason ?? "No reason provided.");

        await db.SaveChangesAsync(cancellationToken);

        var action = request.Approve ? "PARLOUR_APPROVED" : "PARLOUR_REJECTED";
        var detail = request.Approve ? null : request.RejectionReason;
        await audit.LogAsync(
            actor: "admin",
            action: action,
            category: AuditCategory.Moderation,
            subject: $"Parlour:{parlour.Id.Value} — {parlour.Name}",
            detail: detail,
            cancellationToken: cancellationToken);

        return parlour.ToDto();
    }
}
