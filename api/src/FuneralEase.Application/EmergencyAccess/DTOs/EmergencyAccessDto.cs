using FuneralEase.Domain.EmergencyAccess;

namespace FuneralEase.Application.EmergencyAccess.DTOs;

public record EmergencyContactDto(Guid Id, string FullName, string MobileNumber, string Relationship);

public record AccessGrantDto(
    Guid Id,
    Guid ContactId,
    DateTimeOffset ActivatesAt,
    DateTimeOffset ExpiresAt,
    bool IsRevoked,
    bool IsActive);

public record EmergencySessionDto(
    Guid Id,
    Guid HouseholdId,
    List<EmergencyContactDto> Contacts,
    List<AccessGrantDto> ActiveGrants);

public static class EmergencyAccessMappings
{
    public static EmergencyContactDto ToDto(this EmergencyContact c) =>
        new(c.Id.Value, c.FullName, c.MobileNumber, c.Relationship);

    public static AccessGrantDto ToDto(this AccessGrant g) =>
        new(g.Id.Value, g.ContactId.Value, g.ActivatesAt, g.ExpiresAt, g.IsRevoked, g.IsActive);

    public static EmergencySessionDto ToDto(this EmergencyAccessSession s) => new(
        s.Id.Value,
        s.HouseholdId.Value,
        s.Contacts.Select(c => c.ToDto()).ToList(),
        s.Grants.Where(g => !g.IsRevoked).Select(g => g.ToDto()).ToList());
}
