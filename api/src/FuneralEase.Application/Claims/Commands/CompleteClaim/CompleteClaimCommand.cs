using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Claims.Commands.CompleteClaim;

public record CompleteClaimCommand(ClaimId ClaimId, HouseholdId HouseholdId) : IRequest;
