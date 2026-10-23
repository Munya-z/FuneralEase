using FuneralEase.Application.BurialSocieties.DTOs;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.BurialSocieties.Commands.RecordContribution;

public record RecordContributionCommand(
    BurialSocietyId SocietyId,
    HouseholdId CallerHouseholdId,
    Guid MemberId,
    decimal AmountPaid,
    string Period,
    string? Note) : IRequest<BurialSocietyDto>;

public class RecordContributionCommandHandler(IApplicationDbContext db, IAuditLogger audit)
    : IRequestHandler<RecordContributionCommand, BurialSocietyDto>
{
    public async Task<BurialSocietyDto> Handle(RecordContributionCommand request, CancellationToken cancellationToken)
    {
        var society = await db.BurialSocieties
            .Include("_members")
            .Include("_contributions")
            .FirstOrDefaultAsync(s => s.Id == request.SocietyId, cancellationToken)
            ?? throw new InvalidOperationException("Burial society not found.");

        // Only the admin household or the member's own household can record a contribution
        var isAdmin = society.AdminHouseholdId == request.CallerHouseholdId;
        var isMemberHousehold = society.Members.Any(m => m.Id.Value == request.MemberId && m.HouseholdId == request.CallerHouseholdId);
        if (!isAdmin && !isMemberHousehold)
            throw new UnauthorizedAccessException("Access denied.");

        var memberId = new Domain.Common.BurialSocietyMemberId(request.MemberId);
        society.RecordContribution(memberId, request.AmountPaid, request.Period, request.Note);
        await db.SaveChangesAsync(cancellationToken);

        var member = society.Members.FirstOrDefault(m => m.Id.Value == request.MemberId);
        await audit.LogAsync(
            actor: request.CallerHouseholdId.Value.ToString(),
            action: "SOCIETY_CONTRIBUTION_RECORDED",
            category: AuditCategory.Society,
            subject: $"Society:{request.SocietyId.Value} — {society.Name}",
            detail: $"Member:{member?.FullName ?? request.MemberId.ToString()} period:{request.Period} amount:R{request.AmountPaid}",
            cancellationToken: cancellationToken);

        return society.ToDto();
    }
}
