using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EmergencyAccess.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EmergencyAccess.Queries.GetGrant;

public class GetGrantQueryHandler(IApplicationDbContext db) : IRequestHandler<GetGrantQuery, AccessGrantDto>
{
    public async Task<AccessGrantDto> Handle(GetGrantQuery request, CancellationToken cancellationToken)
    {
        var session = await db.EmergencyAccessSessions
            .Include(s => s.Grants)
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.EmergencyAccess.EmergencyAccessSession), request.HouseholdId);

        var grant = session.Grants.FirstOrDefault(g => g.Id == request.GrantId)
            ?? throw new NotFoundException(nameof(Domain.EmergencyAccess.AccessGrant), request.GrantId);

        return grant.ToDto();
    }
}
