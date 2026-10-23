using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Queries.GetPolicies;

public class GetPoliciesQueryHandler(IApplicationDbContext db) : IRequestHandler<GetPoliciesQuery, List<PolicyDto>>
{
    public async Task<List<PolicyDto>> Handle(GetPoliciesQuery request, CancellationToken cancellationToken)
    {
        return await db.Policies
            .Include(p => p.Beneficiaries)
            .Where(p => p.HouseholdId == request.HouseholdId)
            .Select(p => p.ToDto())
            .ToListAsync(cancellationToken);
    }
}
