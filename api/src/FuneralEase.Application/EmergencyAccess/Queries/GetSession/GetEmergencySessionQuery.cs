using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EmergencyAccess.DTOs;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EmergencyAccess.Queries.GetSession;

public record GetEmergencySessionQuery(HouseholdId HouseholdId) : IRequest<EmergencySessionDto?>;

public class GetEmergencySessionQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetEmergencySessionQuery, EmergencySessionDto?>
{
    public async Task<EmergencySessionDto?> Handle(GetEmergencySessionQuery request, CancellationToken cancellationToken)
    {
        var session = await db.EmergencyAccessSessions
            .AsNoTracking()
            .Include(s => s.Contacts)
            .Include(s => s.Grants)
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken);

        return session?.ToDto();
    }
}
