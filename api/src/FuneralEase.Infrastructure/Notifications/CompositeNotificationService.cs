using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FuneralEase.Infrastructure.Notifications;

/// <summary>
/// Tries WhatsApp first; on any failure falls back to SMS.
/// This mirrors the spec requirement: "WhatsApp Business API with SMS fallback".
/// </summary>
public class CompositeNotificationService(
    WhatsAppNotificationService whatsApp,
    VonageSmsNotificationService sms,
    ILogger<CompositeNotificationService> logger) : INotificationService
{
    public async Task SendPremiumReminderAsync(PremiumReminderNotification notification, CancellationToken cancellationToken = default)
    {
        try
        {
            await whatsApp.SendPremiumReminderAsync(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "WhatsApp failed for PremiumReminder — falling back to SMS for {Mobile}", notification.MobileNumber);
            await sms.SendPremiumReminderAsync(notification, cancellationToken);
        }
    }

    public async Task SendEmergencyAccessAlertAsync(EmergencyAccessNotification notification, CancellationToken cancellationToken = default)
    {
        try
        {
            await whatsApp.SendEmergencyAccessAlertAsync(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "WhatsApp failed for EmergencyAccessAlert — falling back to SMS for {Mobile}", notification.ContactMobileNumber);
            await sms.SendEmergencyAccessAlertAsync(notification, cancellationToken);
        }
    }

    public async Task SendClaimSubmittedAsync(ClaimSubmittedNotification notification, CancellationToken cancellationToken = default)
    {
        try
        {
            await whatsApp.SendClaimSubmittedAsync(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "WhatsApp failed for ClaimSubmitted — falling back to SMS for {Mobile}", notification.AdminMobileNumber);
            await sms.SendClaimSubmittedAsync(notification, cancellationToken);
        }
    }

    public async Task SendClaimStatusUpdatedAsync(ClaimStatusUpdatedNotification notification, CancellationToken cancellationToken = default)
    {
        try
        {
            await whatsApp.SendClaimStatusUpdatedAsync(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "WhatsApp failed for ClaimStatusUpdated — falling back to SMS for {Mobile}", notification.AdminMobileNumber);
            await sms.SendClaimStatusUpdatedAsync(notification, cancellationToken);
        }
    }
}
