using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Notifications.Queries;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Notifications.Commands;

public record UpdateNotificationSettingsCommand(
    HouseholdId HouseholdId,
    bool PremiumDue,
    bool PremiumOverdue,
    bool LapseWarning,
    bool ClaimUpdates,
    bool EmergencyAccess,
    bool ReferralJoins) : IRequest<NotificationSettingsDto>;

public class UpdateNotificationSettingsCommandHandler(IApplicationDbContext db)
    : IRequestHandler<UpdateNotificationSettingsCommand, NotificationSettingsDto>
{
    public async Task<NotificationSettingsDto> Handle(UpdateNotificationSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await db.NotificationSettings
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken);

        if (settings is null)
        {
            settings = HouseholdNotificationSettings.CreateDefaults(request.HouseholdId);
            db.NotificationSettings.Add(settings);
        }

        settings.Update(
            request.PremiumDue,
            request.PremiumOverdue,
            request.LapseWarning,
            request.ClaimUpdates,
            request.EmergencyAccess,
            request.ReferralJoins);

        await db.SaveChangesAsync(cancellationToken);

        return new NotificationSettingsDto(
            settings.PremiumDue,
            settings.PremiumOverdue,
            settings.LapseWarning,
            settings.ClaimUpdates,
            settings.EmergencyAccess,
            settings.ReferralJoins);
    }
}
