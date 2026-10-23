using System.Text;
using System.Text.Json;
using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Notifications;

/// <summary>
/// SMS fallback using the Vonage Messages API (supports South African numbers via local termination).
/// Docs: https://developer.vonage.com/en/messages/overview
/// </summary>
public class VonageSmsNotificationService(
    IHttpClientFactory httpClientFactory,
    IOptions<NotificationOptions> options,
    ILogger<VonageSmsNotificationService> logger) : INotificationService
{
    private readonly SmsOptions _opts = options.Value.Sms;

    public async Task SendPremiumReminderAsync(PremiumReminderNotification n, CancellationToken cancellationToken = default)
    {
        var body = n.ReminderType switch
        {
            PremiumReminderType.DueSoon =>
                $"[FuneralEase] Hi {n.PolicyHolderName}, your {n.InsurerName} funeral policy (R{n.PremiumAmount:N2}) is due on {n.NextDueDate:d MMM}. Pay on time to keep your family covered.",
            PremiumReminderType.DueToday =>
                $"[FuneralEase] {n.PolicyHolderName}, your {n.InsurerName} premium of R{n.PremiumAmount:N2} is due TODAY. Pay now to avoid a lapse.",
            PremiumReminderType.Overdue =>
                $"[FuneralEase] URGENT: Your {n.InsurerName} funeral policy premium of R{n.PremiumAmount:N2} is overdue. Pay immediately to avoid losing cover.",
            PremiumReminderType.Lapsed =>
                $"[FuneralEase] Your {n.InsurerName} funeral policy has lapsed. Contact your insurer immediately or open the app to add a replacement policy.",
            _ => $"[FuneralEase] Your {n.InsurerName} policy premium is due. Please pay R{n.PremiumAmount:N2} to maintain cover."
        };

        await SendSmsAsync(n.MobileNumber, body, cancellationToken);
    }

    public async Task SendEmergencyAccessAlertAsync(EmergencyAccessNotification n, CancellationToken cancellationToken = default)
    {
        var body = $"[FuneralEase] Hi {n.ContactName}, you have been granted emergency access to the {n.HouseholdName} vault. Access activates on {n.ActivatesAt:d MMM yyyy 'at' HH:mm}. Open the app or visit funeralease.co.za to view documents.";
        await SendSmsAsync(n.ContactMobileNumber, body, cancellationToken);
    }

    public async Task SendClaimSubmittedAsync(ClaimSubmittedNotification n, CancellationToken cancellationToken = default)
    {
        var body = $"[FuneralEase] Your funeral claim for {n.DeceasedFullName} has been submitted. Claim ref: {n.ClaimId[..8].ToUpper()}. Our team will be in touch within 24 hours.";
        await SendSmsAsync(n.AdminMobileNumber, body, cancellationToken);
    }

    public async Task SendClaimStatusUpdatedAsync(ClaimStatusUpdatedNotification n, CancellationToken cancellationToken = default)
    {
        var statusText = n.NewStatus switch
        {
            "UnderReview" => "is now under review",
            "Approved" => "has been APPROVED",
            "Rejected" => "has been rejected",
            _ => $"status updated to {n.NewStatus}"
        };
        var body = $"[FuneralEase] Your claim for {n.DeceasedFullName} {statusText}. Open the FuneralEase app for details.";
        await SendSmsAsync(n.AdminMobileNumber, body, cancellationToken);
    }

    private async Task SendSmsAsync(string to, string text, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_opts.ApiKey) || string.IsNullOrWhiteSpace(_opts.ApiSecret))
        {
            logger.LogWarning("Vonage SMS not configured — skipping message to {To}", to);
            return;
        }

        var payload = new
        {
            from = new { type = "sms", number = _opts.From },
            to = new { type = "sms", number = NormaliseE164(to) },
            message = new { content = new { type = "text", text } }
        };

        var client = httpClientFactory.CreateClient("Vonage");
        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Vonage Messages API v1 uses Basic auth
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_opts.ApiKey}:{_opts.ApiSecret}"));
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.nexmo.com/v1/messages") { Content = content };
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

        var response = await client.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Vonage SMS error {Status} → {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException($"Vonage API returned {(int)response.StatusCode}");
        }

        logger.LogInformation("SMS sent to {To}", to);
    }

    private static string NormaliseE164(string number)
    {
        number = number.Replace(" ", "").Replace("-", "");
        if (number.StartsWith("0") && number.Length == 10)
            return "27" + number[1..]; // Vonage omits the +
        if (number.StartsWith("+"))
            return number[1..];
        return number;
    }
}
