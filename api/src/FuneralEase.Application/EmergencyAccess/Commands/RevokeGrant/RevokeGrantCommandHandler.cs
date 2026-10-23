using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EmergencyAccess.Commands.RevokeGrant;

public class RevokeGrantCommandHandler(IApplicationDbContext db, IAuditLogger audit)
    : IRequestHandler<RevokeGrantCommand>
{
    public async Task Handle(RevokeGrantCommand request, CancellationToken cancellationToken)
    {
        var session = await db.EmergencyAccessSessions
            .Include(s => s.Grants)
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.EmergencyAccess.EmergencyAccessSession), request.HouseholdId);

        session.RevokeGrant(request.GrantId, request.RevokedByUserId);
        await db.SaveChangesAsync(cancellationToken);

        await audit.LogAsync(
            actor: request.RevokedByUserId.Value.ToString(),
            action: "EMERGENCY_ACCESS_REVOKED",
            category: AuditCategory.Emergency,
            subject: $"Household:{request.HouseholdId.Value}",
            detail: $"Grant:{request.GrantId.Value}",
            cancellationToken: cancellationToken);
    }
}
