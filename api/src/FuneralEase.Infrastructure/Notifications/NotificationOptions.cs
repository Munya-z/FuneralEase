namespace FuneralEase.Infrastructure.Notifications;

public class NotificationOptions
{
    public const string SectionName = "Notifications";

    /// <summary>"Logging" | "WhatsApp" | "Sms"</summary>
    public string Provider { get; init; } = "Logging";

    public WhatsAppOptions WhatsApp { get; init; } = new();
    public SmsOptions Sms { get; init; } = new();
}

public class WhatsAppOptions
{
    /// <summary>Meta Cloud API access token (permanent system-user token).</summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>Phone number ID from Meta Business Manager.</summary>
    public string PhoneNumberId { get; init; } = string.Empty;

    /// <summary>Approved template name for premium reminders (e.g. "funeralease_premium_reminder").</summary>
    public string PremiumReminderTemplateId { get; init; } = "funeralease_premium_reminder";

    /// <summary>Approved template name for emergency access alerts.</summary>
    public string EmergencyAccessTemplateId { get; init; } = "funeralease_emergency_access";

    /// <summary>Approved template name for claim submission confirmations.</summary>
    public string ClaimSubmittedTemplateId { get; init; } = "funeralease_claim_submitted";

    /// <summary>Approved template name for claim status update notifications.</summary>
    public string ClaimStatusUpdatedTemplateId { get; init; } = "funeralease_claim_status_updated";
}

public class SmsOptions
{
    /// <summary>"Vonage" | "Twilio"</summary>
    public string Provider { get; init; } = "Vonage";
    public string ApiKey { get; init; } = string.Empty;
    public string ApiSecret { get; init; } = string.Empty;
    public string From { get; init; } = "FuneralEase";
}
