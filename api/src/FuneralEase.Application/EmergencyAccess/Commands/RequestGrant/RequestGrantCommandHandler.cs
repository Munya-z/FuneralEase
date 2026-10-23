using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EmergencyAccess.DTOs;
using FuneralEase.Domain.Audit;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EmergencyAccess.Commands.RequestGrant;

public class RequestGrantCommandHandler(
    IApplicationDbContext db,
    IAuditLogger audit,
    INotificationService notifications)
    : IRequestHandler<RequestGrantCommand, AccessGrantDto>
{
    private static readonly TimeSpan ActivationDelay = TimeSpan.FromHours(1);  // 1hr delay for security
    private static readonly TimeSpan GrantDuration = TimeSpan.FromHours(48);

    public async Task<AccessGrantDto> Handle(RequestGrantCommand request, CancellationToken cancellationToken)
    {
        var session = await db.EmergencyAccessSessions
            .Include(s => s.Contacts)
            .Include(s => s.Grants)
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.EmergencyAccess.EmergencyAccessSession), request.HouseholdId);

        var grant = session.RequestAccess(request.ContactId, request.RequestedByUserId, ActivationDelay, GrantDuration);
        await db.SaveChangesAsync(cancellationToken);

        var contact = session.Contacts.FirstOrDefault(c => c.Id == request.ContactId);

        await audit.LogAsync(
            actor: request.RequestedByUserId.Value.ToString(),
            action: "EMERGENCY_ACCESS_GRANTED",
            category: AuditCategory.Emergency,
            subject: $"Household:{request.HouseholdId.Value}",
            detail: contact is not null ? $"Contact: {contact.FullName} ({contact.MobileNumber})" : null,
            cancellationToken: cancellationToken);

        if (contact is not null)
        {
            var household = await db.Households
                .AsNoTracking()
                .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken);

            if (household is not null)
            {
                await notifications.SendEmergencyAccessAlertAsync(new EmergencyAccessNotification(
                    ContactMobileNumber: contact.MobileNumber,
                    ContactName: contact.FullName,
                    HouseholdName: household.Name,
                    ActivatesAt: grant.ActivatesAt),
                    cancellationToken);
            }
        }

        return grant.ToDto();
    }
}
