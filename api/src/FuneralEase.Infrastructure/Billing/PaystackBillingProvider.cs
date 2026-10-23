using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Subscriptions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Billing;

/// <summary>
/// Paystack implementation of <see cref="IBillingProvider"/>.
/// Handles transaction initialisation, webhook signature verification, and event parsing.
/// Docs: https://paystack.com/docs/api/
/// </summary>
public class PaystackBillingProvider(
    IHttpClientFactory httpClientFactory,
    IOptions<PaystackOptions> options,
    ILogger<PaystackBillingProvider> logger) : IBillingProvider
{
    private const string BaseUrl = "https://api.paystack.co";

    // Paystack charge event types that represent a completed payment
    private static readonly HashSet<string> ChargeSuccessEvents = new(StringComparer.OrdinalIgnoreCase)
    {
        "charge.success",
        "subscription.create",
        "invoice.payment_failed", // handled as no-op below
    };

    public async Task<InitializeTransactionResult> InitializeTransactionAsync(
        InitializeTransactionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!options.Value.IsConfigured)
        {
            throw new InvalidOperationException(
                "Paystack is not configured. Set PAYSTACK_SECRET_KEY (sk_test_... or sk_live_...) in api/.env and restart the API.");
        }

        var client = httpClientFactory.CreateClient("Paystack");

        // Paystack ZAR amounts are in cents (R9.00 → 900)
        var body = JsonSerializer.Serialize(new
        {
            email = request.Email,
            amount = request.AmountInKobo,
            currency = "ZAR",
            reference = request.Reference,
            callback_url = request.CallbackUrl,
            metadata = new
            {
                household_id = request.HouseholdId,
                tier = request.Tier.ToString(),
            },
        });

        using var content = new StringContent(body, Encoding.UTF8, "application/json");
        using var httpResponse = await client.PostAsync($"{BaseUrl}/transaction/initialize", content, cancellationToken);

        var raw = await httpResponse.Content.ReadAsStringAsync(cancellationToken);

        if (!httpResponse.IsSuccessStatusCode)
        {
            logger.LogError("Paystack transaction/initialize failed ({Status}): {Body}", httpResponse.StatusCode, raw);

            var userMessage = httpResponse.StatusCode == System.Net.HttpStatusCode.Unauthorized
                ? "Paystack rejected the secret key. Check PAYSTACK_SECRET_KEY in api/.env (use sk_test_... from the Paystack dashboard)."
                : "Paystack could not start checkout. Please try again or contact support.";

            throw new InvalidOperationException(userMessage);
        }

        using var doc = JsonDocument.Parse(raw);
        var data = doc.RootElement.GetProperty("data");

        return new InitializeTransactionResult(
            AuthorizationUrl: data.GetProperty("authorization_url").GetString()!,
            AccessCode: data.GetProperty("access_code").GetString()!,
            Reference: data.GetProperty("reference").GetString()!);
    }

    public bool VerifyWebhookSignature(string rawPayload, string providerSignature)
    {
        var secretKey = options.Value.NormalizedSecretKey;
        if (string.IsNullOrEmpty(secretKey)) return false;

        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawPayload));
        var computed = Convert.ToHexString(hash).ToLowerInvariant();

        return string.Equals(computed, providerSignature?.ToLowerInvariant(), StringComparison.Ordinal);
    }

    public BillingWebhookEvent? ParseWebhookEvent(string rawPayload)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawPayload);
            var root = doc.RootElement;

            var eventType = root.GetProperty("event").GetString() ?? "";

            // Only process successful charge / subscription creation events
            if (!ChargeSuccessEvents.Contains(eventType) || eventType.Equals("invoice.payment_failed", StringComparison.OrdinalIgnoreCase))
                return null;

            var data = root.GetProperty("data");

            // Extract household ID from metadata
            if (!data.TryGetProperty("metadata", out var metadata)) return null;
            if (!metadata.TryGetProperty("household_id", out var hhIdEl)) return null;
            var householdId = hhIdEl.GetString();
            if (string.IsNullOrEmpty(householdId)) return null;

            // Tier from metadata (set when initialising the transaction)
            var tierStr = metadata.TryGetProperty("tier", out var tierEl) ? tierEl.GetString() : null;

            // Fall back to plan code → tier map
            if (string.IsNullOrEmpty(tierStr) && data.TryGetProperty("plan", out var planEl))
            {
                var planCode = planEl.ValueKind == JsonValueKind.Object
                    ? planEl.GetProperty("plan_code").GetString()
                    : planEl.GetString();

                if (planCode is not null && options.Value.PlanTierMap.TryGetValue(planCode, out var mapped))
                    tierStr = mapped;
            }

            if (!Enum.TryParse<SubscriptionTier>(tierStr, ignoreCase: true, out var tier))
            {
                logger.LogWarning("PaystackWebhook: could not determine tier from event {EventType}", eventType);
                return null;
            }

            // Provider event ID — use reference for one-off charges, subscription_code for recurring
            var providerEventId =
                (data.TryGetProperty("reference", out var refEl) ? refEl.GetString() : null)
                ?? (data.TryGetProperty("subscription_code", out var subEl) ? subEl.GetString() : null)
                ?? Guid.NewGuid().ToString();

            // Entitlement window: 31 days from now (Paystack will send next month's invoice)
            var expiresAt = DateTimeOffset.UtcNow.AddDays(31);

            return new BillingWebhookEvent(
                EventType: eventType,
                HouseholdId: householdId,
                NewTier: tier,
                EntitlementExpiresAt: expiresAt,
                ProviderEventId: providerEventId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to parse Paystack webhook payload");
            return null;
        }
    }

    public async Task<VerifiedTransaction?> VerifyTransactionAsync(
        string reference,
        CancellationToken cancellationToken = default)
    {
        if (!options.Value.IsConfigured)
            throw new InvalidOperationException("Paystack is not configured.");

        if (string.IsNullOrWhiteSpace(reference))
            return null;

        var client = httpClientFactory.CreateClient("Paystack");
        using var httpResponse = await client.GetAsync(
            $"{BaseUrl}/transaction/verify/{Uri.EscapeDataString(reference)}",
            cancellationToken);

        var raw = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
        if (!httpResponse.IsSuccessStatusCode)
        {
            logger.LogWarning("Paystack verify failed ({Status}): {Body}", httpResponse.StatusCode, raw);
            return null;
        }

        using var doc = JsonDocument.Parse(raw);
        var data = doc.RootElement.GetProperty("data");
        var status = data.TryGetProperty("status", out var statusEl) ? statusEl.GetString() : null;
        var success = string.Equals(status, "success", StringComparison.OrdinalIgnoreCase);

        string? householdId = null;
        SubscriptionTier? tier = null;

        if (data.TryGetProperty("metadata", out var metadata))
        {
            if (metadata.TryGetProperty("household_id", out var hhEl))
                householdId = hhEl.GetString();

            if (metadata.TryGetProperty("tier", out var tierEl)
                && Enum.TryParse<SubscriptionTier>(tierEl.GetString(), ignoreCase: true, out var parsedTier))
            {
                tier = parsedTier;
            }
        }

        var providerEventId =
            (data.TryGetProperty("reference", out var refEl) ? refEl.GetString() : null)
            ?? reference;

        return new VerifiedTransaction(success, providerEventId, householdId, tier, providerEventId);
    }
}
