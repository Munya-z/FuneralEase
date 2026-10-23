using FuneralEase.Application.Policies.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Policies.Queries.GetPolicies;

public record GetPoliciesQuery(HouseholdId HouseholdId) : IRequest<List<PolicyDto>>;
