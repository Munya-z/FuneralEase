using FuneralEase.Application.Claims.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Claims.Queries.GetClaimChecklist;

public record GetClaimChecklistQuery(ClaimId ClaimId, HouseholdId HouseholdId) : IRequest<ClaimDto>;
