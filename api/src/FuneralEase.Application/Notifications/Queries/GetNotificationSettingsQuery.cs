using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Notifications.Queries;

public record NotificationSettingsDto(
    bool PremiumDue,
    bool PremiumOverdue,
    bool LapseWarning,
    bool ClaimUpdates,
    bool EmergencyAccess,
    bool ReferralJoins);

public record GetNotificationSettingsQuery(HouseholdId HouseholdId) : IRequest<NotificationSettingsDto>;

public class GetNotificationSettingsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetNotificationSettingsQuery, NotificationSettingsDto>
{
    public async Task<NotificationSettingsDto> Handle(GetNotificationSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await db.NotificationSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? HouseholdNotificationSettings.CreateDefaults(request.HouseholdId);

        return new NotificationSettingsDto(
            settings.PremiumDue,
            settings.PremiumOverdue,
            settings.LapseWarning,
            settings.ClaimUpdates,
            settings.EmergencyAccess,
            settings.ReferralJoins);
    }
}
