using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Policies.Commands.MarkPremiumPaid;

public record MarkPremiumPaidCommand(PolicyId PolicyId, HouseholdId HouseholdId, DateOnly PaidForDate) : IRequest;
