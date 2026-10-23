using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Policies.Events;

public record PolicyLapsedEvent(PolicyId PolicyId, HouseholdId HouseholdId, LapseStatus NewStatus) : IDomainEvent;
