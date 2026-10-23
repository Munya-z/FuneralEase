using FuneralEase.Domain.Parlours;

namespace FuneralEase.Application.Parlours.DTOs;

public record ParlourDto(Guid Id, string Name, string ContactName, string PhoneNumber, string EmailAddress, string Area, string Province, string? Description, string Status);

public static class ParlourMappings
{
    public static ParlourDto ToDto(this Parlour p) =>
        new(p.Id.Value, p.Name, p.ContactName, p.PhoneNumber, p.EmailAddress, p.Area, p.Province, p.Description, p.Status.ToString());
}
