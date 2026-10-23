using FuneralEase.Api.Extensions;
using FuneralEase.Application.Notifications.Commands;
using FuneralEase.Application.Notifications.Queries;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("notification-settings")]
[Authorize(Policy = "HouseholdMember")]
public class NotificationsController(ISender sender) : ControllerBase
{
    /// <summary>Returns the notification preferences for the authenticated household.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var householdId = User.GetHouseholdId();
        var result = await sender.Send(new GetNotificationSettingsQuery(householdId), ct);
        return Ok(result);
    }

    /// <summary>Updates (upserts) the notification preferences for the authenticated household.</summary>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateNotificationSettingsRequest body, CancellationToken ct)
    {
        var householdId = User.GetHouseholdId();
        var result = await sender.Send(new UpdateNotificationSettingsCommand(
            householdId,
            body.PremiumDue,
            body.PremiumOverdue,
            body.LapseWarning,
            body.ClaimUpdates,
            body.EmergencyAccess,
            body.ReferralJoins), ct);
        return Ok(result);
    }
}

public record UpdateNotificationSettingsRequest(
    bool PremiumDue,
    bool PremiumOverdue,
    bool LapseWarning,
    bool ClaimUpdates,
    bool EmergencyAccess,
    bool ReferralJoins);
