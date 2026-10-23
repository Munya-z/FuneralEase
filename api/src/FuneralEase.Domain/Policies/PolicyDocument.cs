namespace FuneralEase.Domain.Policies;

public class PolicyDocument
{
    public string StorageKey { get; init; } = string.Empty;
    public string OriginalFileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public DateTimeOffset UploadedAt { get; init; }
}
