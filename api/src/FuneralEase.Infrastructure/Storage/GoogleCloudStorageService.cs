using FuneralEase.Application.Common.Interfaces;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Storage;

/// <summary>
/// IFileStorageService backed by Google Cloud Storage.
/// Generates V4 signed URLs so the client can upload/download directly
/// without routing large file payloads through the API server.
/// </summary>
public class GoogleCloudStorageService : IFileStorageService
{
    private readonly GoogleCloudStorageOptions _options;
    private readonly UrlSigner _urlSigner;

    public GoogleCloudStorageService(IOptions<GoogleCloudStorageOptions> options)
    {
        _options = options.Value;
        _urlSigner = BuildUrlSigner(_options);
    }

    public async Task<PresignedUploadUrl> GenerateUploadUrlAsync(
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var storageKey = BuildStorageKey(fileName);
        var expiry = TimeSpan.FromMinutes(_options.UploadUrlExpiryMinutes);

        var requestTemplate = UrlSigner.RequestTemplate
            .FromBucket(_options.BucketName)
            .WithObjectName(storageKey)
            .WithHttpMethod(HttpMethod.Put)
            .WithContentHeaders(new Dictionary<string, IEnumerable<string>>
            {
                ["Content-Type"] = [contentType],
            });

        var signingOptions = UrlSigner.Options.FromDuration(expiry).WithSigningVersion(SigningVersion.V4);

        var uploadUrl = await _urlSigner.SignAsync(requestTemplate, signingOptions, cancellationToken);

        return new PresignedUploadUrl(
            UploadUrl: uploadUrl,
            StorageKey: storageKey,
            ExpiresAt: DateTimeOffset.UtcNow.Add(expiry));
    }

    public async Task<string> GenerateDownloadUrlAsync(
        string storageKey,
        CancellationToken cancellationToken = default)
    {
        var expiry = TimeSpan.FromMinutes(_options.DownloadUrlExpiryMinutes);

        var requestTemplate = UrlSigner.RequestTemplate
            .FromBucket(_options.BucketName)
            .WithObjectName(storageKey)
            .WithHttpMethod(HttpMethod.Get);

        var signingOptions = UrlSigner.Options.FromDuration(expiry).WithSigningVersion(SigningVersion.V4);

        return await _urlSigner.SignAsync(requestTemplate, signingOptions, cancellationToken);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private string BuildStorageKey(string fileName)
    {
        // Sanitise the filename — strip path traversal characters
        var safeName = Path.GetFileName(fileName);
        return $"{_options.Prefix}{Guid.NewGuid()}/{safeName}";
    }

    private static UrlSigner BuildUrlSigner(GoogleCloudStorageOptions options)
    {
        GoogleCredential credential;

        if (!string.IsNullOrWhiteSpace(options.CredentialsJson))
        {
            credential = GoogleCredential.FromJson(options.CredentialsJson);
        }
        else if (!string.IsNullOrWhiteSpace(options.CredentialsFilePath))
        {
            credential = GoogleCredential.FromFile(options.CredentialsFilePath);
        }
        else
        {
            // Application Default Credentials — works on GCE, Cloud Run, GKE
            // with a service account attached to the instance.
            credential = GoogleCredential.GetApplicationDefault();
        }

        // UrlSigner requires a credential that can sign blobs.
        // Service-account credentials support this natively.
        // For ADC that resolves to a service account, we need to scope it first.
        var signingCredential = credential.IsCreateScopedRequired
            ? credential.CreateScoped("https://www.googleapis.com/auth/cloud-platform")
            : credential;

        return UrlSigner.FromCredential(signingCredential);
    }
}
