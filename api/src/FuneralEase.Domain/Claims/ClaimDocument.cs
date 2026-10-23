namespace FuneralEase.Domain.Claims;

public class ClaimDocument
{
    public string StorageKey { get; init; } = string.Empty;
    public string OriginalFileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public DateTimeOffset UploadedAt { get; init; }
}
