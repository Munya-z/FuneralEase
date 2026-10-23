using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Policies.Events;

public record PremiumPaidEvent(PolicyId PolicyId, HouseholdId HouseholdId, DateOnly PaidForDate) : IDomainEvent;
