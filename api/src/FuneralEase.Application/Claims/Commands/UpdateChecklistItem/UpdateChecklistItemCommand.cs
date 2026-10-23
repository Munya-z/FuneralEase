using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Claims.Commands.UpdateChecklistItem;

public record UpdateChecklistItemCommand(ClaimId ClaimId, ChecklistItemId ItemId, HouseholdId HouseholdId, bool IsChecked) : IRequest;
