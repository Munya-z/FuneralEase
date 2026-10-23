using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Parlours;

public enum AppointmentStatus { Pending, Confirmed, Cancelled }

public class ParlourAppointment : AggregateRoot<AppointmentId>
{
    public ParlourId ParlourId { get; private set; }
    public HouseholdId HouseholdId { get; private set; }
    public string ContactName { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public DateOnly? RequestedDate { get; private set; }
    public string? Notes { get; private set; }
    public AppointmentStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private ParlourAppointment() { }

    public static ParlourAppointment Create(
        ParlourId parlourId,
        HouseholdId householdId,
        string contactName,
        string phoneNumber,
        DateOnly? requestedDate,
        string? notes)
    {
        Guard.NotNullOrEmpty(contactName, nameof(contactName));
        Guard.NotNullOrEmpty(phoneNumber, nameof(phoneNumber));

        return new ParlourAppointment
        {
            Id = AppointmentId.New(),
            ParlourId = parlourId,
            HouseholdId = householdId,
            ContactName = contactName,
            PhoneNumber = phoneNumber,
            RequestedDate = requestedDate,
            Notes = notes,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Confirm()
    {
        if (Status != AppointmentStatus.Pending)
            throw new InvalidOperationException("Only pending appointments can be confirmed.");

        Status = AppointmentStatus.Confirmed;
    }

    public void Cancel()
    {
        if (Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Appointment is already cancelled.");

        Status = AppointmentStatus.Cancelled;
    }
}
