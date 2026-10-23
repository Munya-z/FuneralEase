using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.EmergencyAccess.Commands.RevokeGrant;

public record RevokeGrantCommand(HouseholdId HouseholdId, AccessGrantId GrantId, UserId RevokedByUserId) : IRequest;
