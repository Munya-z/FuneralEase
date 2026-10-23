using FuneralEase.Application.Claims.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Claims.Commands.CreateClaim;

public record CreateClaimCommand(PolicyId PolicyId, HouseholdId HouseholdId, string DeceasedFullName) : IRequest<ClaimDto>;
