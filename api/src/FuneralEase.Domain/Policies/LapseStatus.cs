namespace FuneralEase.Domain.Policies;

public enum LapseStatus
{
    Current,
    DueSoon,   // within 7 days of NextDueDate
    Overdue,   // past NextDueDate
    Lapsed     // 30+ days past NextDueDate
}
