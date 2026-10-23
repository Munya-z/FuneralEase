using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Notifications;

/// <summary>
/// Sends notifications via the Meta WhatsApp Cloud API using pre-approved message templates.
/// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/template-messages
/// </summary>
public class WhatsAppNotificationService(
    IHttpClientFactory httpClientFactory,
    IOptions<NotificationOptions> options,
    ILogger<WhatsAppNotificationService> logger) : INotificationService
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    private readonly WhatsAppOptions _opts = options.Value.WhatsApp;

    public async Task SendPremiumReminderAsync(PremiumReminderNotification n, CancellationToken cancellationToken = default)
    {
        // Map lapse status to template body parameters
        var (headerParam, urgencyParam) = n.ReminderType switch
        {
            PremiumReminderType.DueSoon => ("Reminder", $"due in 7 days on {n.NextDueDate:d MMM yyyy}"),
            PremiumReminderType.DueToday => ("Action required", $"due TODAY — {n.NextDueDate:d MMM yyyy}"),
            PremiumReminderType.Overdue => ("Overdue", $"overdue since {n.NextDueDate:d MMM yyyy}"),
            PremiumReminderType.Lapsed => ("Policy lapsed", $"lapsed — contact your insurer immediately"),
            _ => ("Reminder", n.NextDueDate.ToString())
        };

        var payload = new
        {
            messaging_product = "whatsapp",
            to = NormaliseE164(n.MobileNumber),
            type = "template",
            template = new
            {
                name = _opts.PremiumReminderTemplateId,
                language = new { code = "en_ZA" },
                components = new object[]
                {
                    new
                    {
                        type = "header",
                        parameters = new[] { new { type = "text", text = headerParam } }
                    },
                    new
                    {
                        type = "body",
                        parameters = new[]
                        {
                            new { type = "text", text = n.PolicyHolderName },
                            new { type = "text", text = n.InsurerName },
                            new { type = "text", text = $"R{n.PremiumAmount:N2}" },
                            new { type = "text", text = urgencyParam }
                        }
                    }
                }
            }
        };

        await SendAsync(payload, n.MobileNumber, "PremiumReminder", cancellationToken);
    }

    public async Task SendEmergencyAccessAlertAsync(EmergencyAccessNotification n, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            messaging_product = "whatsapp",
            to = NormaliseE164(n.ContactMobileNumber),
            type = "template",
            template = new
            {
                name = _opts.EmergencyAccessTemplateId,
                language = new { code = "en_ZA" },
                components = new object[]
                {
                    new
                    {
                        type = "body",
                        parameters = new[]
                        {
                            new { type = "text", text = n.ContactName },
                            new { type = "text", text = n.HouseholdName },
                            new { type = "text", text = n.ActivatesAt.ToString("d MMM yyyy 'at' HH:mm") }
                        }
                    }
                }
            }
        };

        await SendAsync(payload, n.ContactMobileNumber, "EmergencyAccessAlert", cancellationToken);
    }

    public async Task SendClaimSubmittedAsync(ClaimSubmittedNotification n, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            messaging_product = "whatsapp",
            to = NormaliseE164(n.AdminMobileNumber),
            type = "template",
            template = new
            {
                name = _opts.ClaimSubmittedTemplateId,
                language = new { code = "en_ZA" },
                components = new object[]
                {
                    new
                    {
                        type = "body",
                        parameters = new[]
                        {
                            new { type = "text", text = n.HouseholdName },
                            new { type = "text", text = n.DeceasedFullName },
                            new { type = "text", text = n.ClaimId }
                        }
                    }
                }
            }
        };

        await SendAsync(payload, n.AdminMobileNumber, "ClaimSubmitted", cancellationToken);
    }

    public async Task SendClaimStatusUpdatedAsync(ClaimStatusUpdatedNotification n, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            messaging_product = "whatsapp",
            to = NormaliseE164(n.AdminMobileNumber),
            type = "template",
            template = new
            {
                name = _opts.ClaimStatusUpdatedTemplateId,
                language = new { code = "en_ZA" },
                components = new object[]
                {
                    new
                    {
                        type = "body",
                        parameters = new[]
                        {
                            new { type = "text", text = n.HouseholdName },
                            new { type = "text", text = n.DeceasedFullName },
                            new { type = "text", text = n.NewStatus }
                        }
                    }
                }
            }
        };

        await SendAsync(payload, n.AdminMobileNumber, "ClaimStatusUpdated", cancellationToken);
    }

    private async Task SendAsync(object payload, string recipientForLog, string eventType, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_opts.AccessToken) || string.IsNullOrWhiteSpace(_opts.PhoneNumberId))
        {
            logger.LogWarning("WhatsApp not configured — skipping {EventType} for {Recipient}", eventType, recipientForLog);
            return;
        }

        var client = httpClientFactory.CreateClient("WhatsApp");
        var json = JsonSerializer.Serialize(payload, JsonOpts);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var url = $"https://graph.facebook.com/v19.0/{_opts.PhoneNumberId}/messages";

        using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _opts.AccessToken);

        var response = await client.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("WhatsApp API error {Status} for {EventType} → {Body}", (int)response.StatusCode, eventType, body);
            throw new HttpRequestException($"WhatsApp API returned {(int)response.StatusCode}");
        }

        logger.LogInformation("WhatsApp {EventType} sent to {Recipient}", eventType, recipientForLog);
    }

    /// <summary>Normalises SA mobile numbers to E.164 (+27...) for the WhatsApp API.</summary>
    private static string NormaliseE164(string number)
    {
        number = number.Replace(" ", "").Replace("-", "");
        if (number.StartsWith("0") && number.Length == 10)
            return "+27" + number[1..];
        if (!number.StartsWith("+"))
            return "+" + number;
        return number;
    }
}
