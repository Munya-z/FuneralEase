using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EmergencyAccess.DTOs;
using FuneralEase.Domain.EmergencyAccess;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EmergencyAccess.Commands.UpsertContacts;

public class UpsertEmergencyContactsCommandHandler(IApplicationDbContext db)
    : IRequestHandler<UpsertEmergencyContactsCommand, EmergencySessionDto>
{
    public async Task<EmergencySessionDto> Handle(UpsertEmergencyContactsCommand request, CancellationToken cancellationToken)
    {
        var subscription = await db.Subscriptions
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Subscriptions.Subscription), request.HouseholdId);

        if (request.Contacts.Count > subscription.MaxEmergencyContacts)
            throw new ForbiddenException($"Your plan allows up to {subscription.MaxEmergencyContacts} emergency contacts.");

        var session = await db.EmergencyAccessSessions
            .Include(s => s.Contacts)
            .Include(s => s.Grants)
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken);

        if (session is null)
        {
            session = EmergencyAccessSession.Create(request.HouseholdId);
            db.EmergencyAccessSessions.Add(session);
        }

        session.UpsertContacts(request.Contacts.Select(c => (c.FullName, c.MobileNumber, c.Relationship, c.SaIdNumber, c.AccessMode)));
        await db.SaveChangesAsync(cancellationToken);
        return session.ToDto();
    }
}
