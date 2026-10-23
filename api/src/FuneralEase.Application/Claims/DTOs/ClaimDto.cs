using FuneralEase.Domain.Claims;

namespace FuneralEase.Application.Claims.DTOs;

public record ClaimDto(
    Guid Id,
    Guid PolicyId,
    Guid HouseholdId,
    string DeceasedFullName,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? SubmittedAt,
    List<ChecklistItemDto> ChecklistItems,
    List<ClaimDocumentDto> Documents);

public record ChecklistItemDto(Guid Id, string Description, string ItemType, bool IsChecked);

public record ClaimDocumentDto(string StorageKey, string OriginalFileName, string ContentType, DateTimeOffset UploadedAt);

public static class ClaimMappings
{
    public static ClaimDto ToDto(this Claim c) => new(
        c.Id.Value,
        c.PolicyId.Value,
        c.HouseholdId.Value,
        c.DeceasedFullName,
        c.Status.ToString(),
        c.CreatedAt,
        c.SubmittedAt,
        c.ChecklistItems.Select(i => new ChecklistItemDto(i.Id.Value, i.Description, i.ItemType.ToString(), i.IsChecked)).ToList(),
        c.Documents.Select(d => new ClaimDocumentDto(d.StorageKey, d.OriginalFileName, d.ContentType, d.UploadedAt)).ToList());
}
