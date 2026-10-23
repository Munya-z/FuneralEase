using FuneralEase.Application.Common.Interfaces;

namespace FuneralEase.Infrastructure.Storage;

/// <summary>
/// Stub file storage for dev. Replace with GCS/S3 in production.
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    public Task<PresignedUploadUrl> GenerateUploadUrlAsync(string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var storageKey = $"uploads/{Guid.NewGuid()}/{fileName}";
        var result = new PresignedUploadUrl(
            UploadUrl: $"https://storage.example.com/{storageKey}?token=dev-token",
            StorageKey: storageKey,
            ExpiresAt: DateTimeOffset.UtcNow.AddMinutes(15));
        return Task.FromResult(result);
    }

    public Task<string> GenerateDownloadUrlAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        return Task.FromResult($"https://storage.example.com/{storageKey}?token=dev-token");
    }
}
