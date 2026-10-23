using FuneralEase.Application.BurialSocieties.DTOs;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.BurialSocieties.Queries.GetBurialSociety;

public record GetBurialSocietyQuery(HouseholdId HouseholdId) : IRequest<BurialSocietyDto?>;

public class GetBurialSocietyQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetBurialSocietyQuery, BurialSocietyDto?>
{
    public async Task<BurialSocietyDto?> Handle(GetBurialSocietyQuery request, CancellationToken cancellationToken)
    {
        var society = await db.BurialSocieties
            .AsNoTracking()
            .Include("_members")
            .Include("_contributions")
            .FirstOrDefaultAsync(
                s => s.AdminHouseholdId == request.HouseholdId
                  || s.Members.Any(m => m.HouseholdId == request.HouseholdId),
                cancellationToken);

        return society?.ToDto();
    }
}
