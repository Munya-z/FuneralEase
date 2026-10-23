using FuneralEase.Application.EmergencyAccess.DTOs;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.EmergencyAccess;
using MediatR;

namespace FuneralEase.Application.EmergencyAccess.Commands.UpsertContacts;

public record ContactInput(
    string FullName,
    string MobileNumber,
    string Relationship,
    string? SaIdNumber,
    AccessMode AccessMode = AccessMode.Delayed);

public record UpsertEmergencyContactsCommand(HouseholdId HouseholdId, List<ContactInput> Contacts) : IRequest<EmergencySessionDto>;
