using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;

namespace FuneralEase.Application.Subscriptions.Queries.GetSubscription;

public record SubscriptionDto(
    Guid Id,
    Guid HouseholdId,
    string Tier,
    string Channel,
    DateTimeOffset? EntitlementExpiresAt,
    DateTimeOffset? TrialEndsAt,
    bool IsInTrial,
    bool IsActive);

public record GetSubscriptionQuery(HouseholdId HouseholdId) : IRequest<SubscriptionDto>;
