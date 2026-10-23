namespace FuneralEase.Application.Common.Interfaces;

public enum PremiumReminderType
{
    DueSoon,     // 7 days before premium is due
    DueToday,    // due date has arrived
    Overdue,     // payment past due
    Lapsed       // policy has lapsed
}

public record PremiumReminderNotification(
    string MobileNumber,
    string PolicyHolderName,
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    DateOnly NextDueDate,
    PremiumReminderType ReminderType);

public record EmergencyAccessNotification(
    string ContactMobileNumber,
    string ContactName,
    string HouseholdName,
    DateTimeOffset ActivatesAt);

public record ClaimSubmittedNotification(
    string AdminMobileNumber,
    string HouseholdName,
    string DeceasedFullName,
    string ClaimId);

public record ClaimStatusUpdatedNotification(
    string AdminMobileNumber,
    string HouseholdName,
    string DeceasedFullName,
    string NewStatus);

/// <summary>
/// Sends transactional messages via WhatsApp Business API with SMS fallback.
/// Implementations should handle channel selection, retry, and rate limits.
/// </summary>
public interface INotificationService
{
    Task SendPremiumReminderAsync(PremiumReminderNotification notification, CancellationToken cancellationToken = default);
    Task SendEmergencyAccessAlertAsync(EmergencyAccessNotification notification, CancellationToken cancellationToken = default);
    Task SendClaimSubmittedAsync(ClaimSubmittedNotification notification, CancellationToken cancellationToken = default);
    Task SendClaimStatusUpdatedAsync(ClaimStatusUpdatedNotification notification, CancellationToken cancellationToken = default);
}
