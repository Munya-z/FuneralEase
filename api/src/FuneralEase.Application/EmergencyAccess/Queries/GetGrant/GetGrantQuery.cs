using FuneralEase.Application.EmergencyAccess.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.EmergencyAccess.Queries.GetGrant;

public record GetGrantQuery(HouseholdId HouseholdId, AccessGrantId GrantId) : IRequest<AccessGrantDto>;
