using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.FuneralWishes;

public record GetWishesQuery(HouseholdId HouseholdId) : IRequest<FuneralWishesDto?>;

public class GetWishesQueryHandler(IApplicationDbContext db) : IRequestHandler<GetWishesQuery, FuneralWishesDto?>
{
    public async Task<FuneralWishesDto?> Handle(GetWishesQuery request, CancellationToken cancellationToken)
    {
        var wishes = await db.FuneralWishes
            .FirstOrDefaultAsync(w => w.HouseholdId == request.HouseholdId, cancellationToken);

        return wishes?.ToDto();
    }
}
