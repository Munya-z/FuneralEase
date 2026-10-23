using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Commands.UpdatePolicy;

public class UpdatePolicyCommandHandler(IApplicationDbContext db) : IRequestHandler<UpdatePolicyCommand, PolicyDto>
{
    public async Task<PolicyDto> Handle(UpdatePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .Include(p => p.Beneficiaries)
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Policies.Policy), request.PolicyId);

        policy.Update(request.InsurerName, request.PolicyNumber, request.PremiumAmount, request.NextDueDate, request.CoverAmount);
        await db.SaveChangesAsync(cancellationToken);
        return policy.ToDto();
    }
}
