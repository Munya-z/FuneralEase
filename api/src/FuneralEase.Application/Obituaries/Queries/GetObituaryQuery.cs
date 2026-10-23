using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Obituaries.Commands;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Obituaries.Queries;

public record GetObituaryQuery(HouseholdId HouseholdId) : IRequest<ObituaryDto?>;

public class GetObituaryQueryHandler(IApplicationDbContext db) : IRequestHandler<GetObituaryQuery, ObituaryDto?>
{
    public async Task<ObituaryDto?> Handle(GetObituaryQuery request, CancellationToken cancellationToken)
    {
        var obituary = await db.Obituaries
            .FirstOrDefaultAsync(o => o.HouseholdId == request.HouseholdId, cancellationToken);

        return obituary?.ToDto();
    }
}
