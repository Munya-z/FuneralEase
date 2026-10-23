namespace FuneralEase.Infrastructure.Billing;

public class PaystackOptions
{
    public const string SectionName = "Paystack";

    /// <summary>Secret key from the Paystack dashboard (sk_live_... or sk_test_...).</summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>Public key (pk_live_... or pk_test_...) for client-side Paystack widgets if needed.</summary>
    public string PublicKey { get; set; } = string.Empty;

    /// <summary>
    /// Maps Paystack plan codes to subscription tier names.
    /// E.g. { "PLN_individual_monthly": "Individual", "PLN_family_monthly": "Family" }
    /// </summary>
    public Dictionary<string, string> PlanTierMap { get; set; } = new();

    /// <summary>Normalized secret key (strips accidental "Bearer " prefix / whitespace).</summary>
    public string NormalizedSecretKey
    {
        get
        {
            var key = SecretKey?.Trim() ?? string.Empty;
            if (key.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                key = key["Bearer ".Length..].Trim();
            return key;
        }
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(NormalizedSecretKey)
        && (NormalizedSecretKey.StartsWith("sk_test_", StringComparison.Ordinal)
            || NormalizedSecretKey.StartsWith("sk_live_", StringComparison.Ordinal));
}
