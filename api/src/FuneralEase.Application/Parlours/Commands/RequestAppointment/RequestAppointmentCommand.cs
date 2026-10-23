using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Parlours;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Parlours.Commands.RequestAppointment;

public record RequestAppointmentCommand(
    ParlourId ParlourId,
    HouseholdId HouseholdId,
    string ContactName,
    string PhoneNumber,
    DateOnly? RequestedDate,
    string? Notes) : IRequest<Guid>;

public class RequestAppointmentCommandHandler(IApplicationDbContext db) : IRequestHandler<RequestAppointmentCommand, Guid>
{
    public async Task<Guid> Handle(RequestAppointmentCommand request, CancellationToken cancellationToken)
    {
        var parlour = await db.Parlours
            .FirstOrDefaultAsync(p => p.Id == request.ParlourId, cancellationToken)
            ?? throw new NotFoundException(nameof(Parlour), request.ParlourId);

        if (parlour.Status != ParlourStatus.Active)
            throw new InvalidOperationException("Appointments can only be requested with active parlours.");

        var appointment = ParlourAppointment.Create(
            request.ParlourId,
            request.HouseholdId,
            request.ContactName,
            request.PhoneNumber,
            request.RequestedDate,
            request.Notes);

        db.ParlourAppointments.Add(appointment);
        await db.SaveChangesAsync(cancellationToken);
        return appointment.Id.Value;
    }
}
