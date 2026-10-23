using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.DTOs;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Commands.AddBeneficiary;

public record AddBeneficiaryCommand(
    PolicyId PolicyId,
    HouseholdId HouseholdId,
    string FullName,
    string Relationship,
    decimal BenefitPercentage) : IRequest<PolicyDto>;

public class AddBeneficiaryCommandHandler(IApplicationDbContext db)
    : IRequestHandler<AddBeneficiaryCommand, PolicyDto>
{
    public async Task<PolicyDto> Handle(AddBeneficiaryCommand request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .Include(p => p.Beneficiaries)
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Policy not found.");

        policy.AddBeneficiary(request.FullName, request.Relationship, request.BenefitPercentage);
        await db.SaveChangesAsync(cancellationToken);
        return policy.ToDto();
    }
}
