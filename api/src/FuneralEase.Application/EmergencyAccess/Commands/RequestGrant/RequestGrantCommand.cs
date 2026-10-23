using FuneralEase.Application.EmergencyAccess.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.EmergencyAccess.Commands.RequestGrant;

public record RequestGrantCommand(HouseholdId HouseholdId, EmergencyContactId ContactId, UserId RequestedByUserId) : IRequest<AccessGrantDto>;
