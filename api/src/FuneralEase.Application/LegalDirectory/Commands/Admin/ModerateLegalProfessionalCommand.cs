using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.LegalDirectory.Commands;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.LegalDirectory;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.LegalDirectory.Commands.Admin;

public enum ModerationAction { Approve, Reject }

public record ModerateLegalProfessionalCommand(
    LegalProfessionalId Id,
    ModerationAction Action,
    string? Note = null) : IRequest<LegalProfessionalDto>;

public class ModerateLegalProfessionalCommandHandler(IApplicationDbContext db, IAuditLogger auditLogger)
    : IRequestHandler<ModerateLegalProfessionalCommand, LegalProfessionalDto>
{
    public async Task<LegalProfessionalDto> Handle(ModerateLegalProfessionalCommand request, CancellationToken cancellationToken)
    {
        var professional = await db.LegalProfessionals
            .FirstOrDefaultAsync(lp => lp.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(LegalProfessional), request.Id);

        if (request.Action == ModerationAction.Approve)
            professional.Approve();
        else
            professional.Reject(request.Note ?? "Rejected by admin.");

        await db.SaveChangesAsync(cancellationToken);

        await auditLogger.LogAsync(
            actor: "Admin",
            action: $"LegalProfessional.{request.Action}",
            category: AuditCategory.Moderation,
            subject: professional.Id.Value.ToString(),
            detail: $"{professional.FirmName} was {request.Action.ToString().ToLower()}ed. Note: {request.Note}",
            cancellationToken: cancellationToken);

        return professional.ToDto();
    }
}
