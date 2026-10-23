namespace FuneralEase.Infrastructure.Storage;

public class GoogleCloudStorageOptions
{
    public const string SectionName = "GoogleCloudStorage";

    /// <summary>GCS bucket name (e.g. "funeralease-documents").</summary>
    public string BucketName { get; set; } = string.Empty;

    /// <summary>
    /// Path to a service-account JSON key file.
    /// If null, Application Default Credentials are used (recommended for GCP-hosted workloads).
    /// </summary>
    public string? CredentialsFilePath { get; set; }

    /// <summary>
    /// Inline service-account JSON. Takes precedence over CredentialsFilePath when set.
    /// Useful when credentials are stored in a secret manager and injected as an env variable.
    /// </summary>
    public string? CredentialsJson { get; set; }

    /// <summary>How long signed upload URLs are valid (default: 15 minutes).</summary>
    public int UploadUrlExpiryMinutes { get; set; } = 15;

    /// <summary>How long signed download URLs are valid (default: 60 minutes).</summary>
    public int DownloadUrlExpiryMinutes { get; set; } = 60;

    /// <summary>
    /// Folder prefix within the bucket (e.g. "policy-documents/").
    /// Objects are stored at {Prefix}{guid}/{filename}.
    /// </summary>
    public string Prefix { get; set; } = "policy-documents/";
}
