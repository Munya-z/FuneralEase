using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.DTOs;
using FuneralEase.Domain.Policies;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Commands.CreatePolicy;

public class CreatePolicyCommandHandler(IApplicationDbContext db) : IRequestHandler<CreatePolicyCommand, PolicyDto>
{
    public async Task<PolicyDto> Handle(CreatePolicyCommand request, CancellationToken cancellationToken)
    {
        // Enforce tier gate
        var subscription = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Subscriptions.Subscription), request.HouseholdId);

        var policyCount = await db.Policies
            .CountAsync(p => p.HouseholdId == request.HouseholdId, cancellationToken);

        if (policyCount >= subscription.MaxPolicies)
            throw new ForbiddenException($"Your current plan allows a maximum of {subscription.MaxPolicies} policy. Upgrade to add more.");

        var policy = Policy.Create(
            request.HouseholdId,
            request.InsurerName,
            request.PolicyNumber,
            request.PremiumAmount,
            request.NextDueDate,
            request.CoverAmount);

        db.Policies.Add(policy);
        await db.SaveChangesAsync(cancellationToken);

        return policy.ToDto();
    }
}
