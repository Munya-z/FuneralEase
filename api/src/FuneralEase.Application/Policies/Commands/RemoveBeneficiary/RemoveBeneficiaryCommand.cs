using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.DTOs;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Commands.RemoveBeneficiary;

public record RemoveBeneficiaryCommand(
    PolicyId PolicyId,
    HouseholdId HouseholdId,
    Guid BeneficiaryId) : IRequest<PolicyDto>;

public class RemoveBeneficiaryCommandHandler(IApplicationDbContext db)
    : IRequestHandler<RemoveBeneficiaryCommand, PolicyDto>
{
    public async Task<PolicyDto> Handle(RemoveBeneficiaryCommand request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .Include(p => p.Beneficiaries)
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Policy not found.");

        policy.RemoveBeneficiary(request.BeneficiaryId);
        await db.SaveChangesAsync(cancellationToken);
        return policy.ToDto();
    }
}
