using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EstateChecklist.Commands;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EstateChecklist.Queries;

public record GetEstateChecklistQuery(HouseholdId HouseholdId) : IRequest<EstateChecklistDto?>;

public class GetEstateChecklistQueryHandler(IApplicationDbContext db) : IRequestHandler<GetEstateChecklistQuery, EstateChecklistDto?>
{
    public async Task<EstateChecklistDto?> Handle(GetEstateChecklistQuery request, CancellationToken cancellationToken)
    {
        var checklist = await db.EstateChecklists
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.HouseholdId == request.HouseholdId, cancellationToken);

        return checklist?.ToDto();
    }
}
