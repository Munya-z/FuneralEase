using FuneralEase.Application.Policies.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Policies.Commands.CreatePolicy;

public record CreatePolicyCommand(
    HouseholdId HouseholdId,
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    DateOnly NextDueDate,
    decimal? CoverAmount = null) : IRequest<PolicyDto>;
