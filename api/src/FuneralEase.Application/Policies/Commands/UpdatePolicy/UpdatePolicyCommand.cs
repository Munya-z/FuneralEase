using FuneralEase.Application.Policies.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Policies.Commands.UpdatePolicy;

public record UpdatePolicyCommand(
    PolicyId PolicyId,
    HouseholdId HouseholdId,
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    DateOnly NextDueDate,
    decimal? CoverAmount = null) : IRequest<PolicyDto>;
