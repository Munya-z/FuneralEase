namespace FuneralEase.Application.Common.Interfaces;

public record PresignedUploadUrl(string UploadUrl, string StorageKey, DateTimeOffset ExpiresAt);

public interface IFileStorageService
{
    Task<PresignedUploadUrl> GenerateUploadUrlAsync(string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<string> GenerateDownloadUrlAsync(string storageKey, CancellationToken cancellationToken = default);
}
