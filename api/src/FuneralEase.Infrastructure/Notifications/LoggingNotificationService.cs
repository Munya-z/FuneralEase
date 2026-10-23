using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FuneralEase.Infrastructure.Notifications;

/// <summary>
/// Development stub — logs all notifications instead of sending them.
/// Replace with WhatsAppNotificationService (Meta Cloud API) + SmsNotificationService (Vonage/Twilio)
/// before going to production. Toggle via appsettings: Notifications:Provider = "Logging" | "WhatsApp".
/// </summary>
public class LoggingNotificationService(ILogger<LoggingNotificationService> logger) : INotificationService
{
    public Task SendPremiumReminderAsync(PremiumReminderNotification n, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[NOTIFICATION] PremiumReminder ({Type}) → {Mobile} | {Insurer} policy {PolicyNumber} | R{Amount:N2} due {DueDate}",
            n.ReminderType, n.MobileNumber, n.InsurerName, n.PolicyNumber, n.PremiumAmount, n.NextDueDate);

        return Task.CompletedTask;
    }

    public Task SendEmergencyAccessAlertAsync(EmergencyAccessNotification n, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[NOTIFICATION] EmergencyAccess → {Mobile} | Contact: {Contact} | Household: {Household} | Activates: {ActivatesAt}",
            n.ContactMobileNumber, n.ContactName, n.HouseholdName, n.ActivatesAt);

        return Task.CompletedTask;
    }

    public Task SendClaimSubmittedAsync(ClaimSubmittedNotification n, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[NOTIFICATION] ClaimSubmitted → {Mobile} | Household: {Household} | Deceased: {Deceased} | Claim: {ClaimId}",
            n.AdminMobileNumber, n.HouseholdName, n.DeceasedFullName, n.ClaimId);

        return Task.CompletedTask;
    }

    public Task SendClaimStatusUpdatedAsync(ClaimStatusUpdatedNotification n, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[NOTIFICATION] ClaimStatusUpdated → {Mobile} | Household: {Household} | Deceased: {Deceased} | Status: {Status}",
            n.AdminMobileNumber, n.HouseholdName, n.DeceasedFullName, n.NewStatus);

        return Task.CompletedTask;
    }
}
