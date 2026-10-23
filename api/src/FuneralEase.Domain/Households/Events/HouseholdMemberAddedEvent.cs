using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Households.Events;

public record HouseholdMemberAddedEvent(HouseholdId HouseholdId, UserId UserId, MemberRole Role) : IDomainEvent;
