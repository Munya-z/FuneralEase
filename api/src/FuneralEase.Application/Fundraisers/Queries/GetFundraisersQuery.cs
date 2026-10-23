using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Fundraisers.Commands;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Fundraisers.Queries;

public record GetFundraisersQuery(HouseholdId HouseholdId) : IRequest<List<FundraiserDto>>;

public class GetFundraisersQueryHandler(IApplicationDbContext db) : IRequestHandler<GetFundraisersQuery, List<FundraiserDto>>
{
    public async Task<List<FundraiserDto>> Handle(GetFundraisersQuery request, CancellationToken cancellationToken)
    {
        // Materialize first — TotalCollected is a computed domain property and cannot be projected in SQL.
        var fundraisers = await db.Fundraisers
            .AsNoTracking()
            .Include(f => f.Contributions)
            .Where(f => f.HouseholdId == request.HouseholdId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);

        return fundraisers.Select(f => f.ToDto()).ToList();
    }
}
