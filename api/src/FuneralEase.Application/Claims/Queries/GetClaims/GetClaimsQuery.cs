using FuneralEase.Application.Claims.DTOs;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Queries.GetClaims;

public record GetClaimsQuery(HouseholdId HouseholdId) : IRequest<List<ClaimDto>>;

public class GetClaimsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetClaimsQuery, List<ClaimDto>>
{
    public async Task<List<ClaimDto>> Handle(GetClaimsQuery request, CancellationToken cancellationToken)
    {
        var claims = await db.Claims
            .AsNoTracking()
            .Where(c => c.HouseholdId == request.HouseholdId)
            .Include(c => c.ChecklistItems)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return claims.Select(c => c.ToDto()).ToList();
    }
}
