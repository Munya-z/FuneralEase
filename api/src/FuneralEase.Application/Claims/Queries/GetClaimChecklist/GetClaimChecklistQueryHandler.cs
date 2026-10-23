using FuneralEase.Application.Claims.DTOs;
using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Queries.GetClaimChecklist;

public class GetClaimChecklistQueryHandler(IApplicationDbContext db) : IRequestHandler<GetClaimChecklistQuery, ClaimDto>
{
    public async Task<ClaimDto> Handle(GetClaimChecklistQuery request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .Include(c => c.ChecklistItems)
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Claims.Claim), request.ClaimId);

        return claim.ToDto();
    }
}
