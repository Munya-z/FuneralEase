using FuneralEase.Api.Extensions;
using FuneralEase.Application.EmergencyAccess.Commands.RequestGrant;
using FuneralEase.Application.EmergencyAccess.Commands.RevokeGrant;
using FuneralEase.Application.EmergencyAccess.Commands.UpsertContacts;
using FuneralEase.Application.EmergencyAccess.Queries.GetGrant;
using FuneralEase.Application.EmergencyAccess.Queries.GetGrantView;
using FuneralEase.Application.EmergencyAccess.Queries.GetSession;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("emergency-access")]
[Authorize(Policy = "HouseholdMember")]
public class EmergencyAccessController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSession(CancellationToken ct)
    {
        var result = await sender.Send(new GetEmergencySessionQuery(User.GetHouseholdId()), ct);
        if (result is null) return Ok(new { contacts = Array.Empty<object>(), activeGrants = Array.Empty<object>() });
        return Ok(result);
    }

    [HttpPost("contacts")]
    public async Task<IActionResult> UpsertContacts([FromBody] UpsertContactsRequest request, CancellationToken ct)
    {
        var command = new UpsertEmergencyContactsCommand(
            User.GetHouseholdId(),
            request.Contacts.Select(c => new ContactInput(c.FullName, c.MobileNumber, c.Relationship, c.SaIdNumber)).ToList());
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("request")]
    public async Task<IActionResult> RequestGrant([FromBody] RequestGrantRequest request, CancellationToken ct)
    {
        var command = new RequestGrantCommand(User.GetHouseholdId(), new EmergencyContactId(request.ContactId), User.GetUserId());
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpGet("grants/{grantId:guid}")]
    public async Task<IActionResult> GetGrant(Guid grantId, CancellationToken ct)
    {
        var result = await sender.Send(new GetGrantQuery(User.GetHouseholdId(), new AccessGrantId(grantId)), ct);
        return Ok(result);
    }

    [HttpPost("grants/{grantId:guid}/revoke")]
    public async Task<IActionResult> RevokeGrant(Guid grantId, CancellationToken ct)
    {
        await sender.Send(new RevokeGrantCommand(User.GetHouseholdId(), new AccessGrantId(grantId), User.GetUserId()), ct);
        return NoContent();
    }

    /// <summary>
    /// Unauthenticated guest endpoint — the grant ID is the credential.
    /// Returns household policies if the grant is currently active.
    /// Used by emergency contacts who receive a link with the grant ID embedded.
    /// </summary>
    [HttpGet("view/{grantId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> ViewGrant(Guid grantId, CancellationToken ct)
    {
        var result = await sender.Send(new GetGrantViewQuery(new AccessGrantId(grantId)), ct);
        if (result is null) return NotFound(new { title = "Grant not found or no longer active." });
        return Ok(result);
    }
}

public record ContactInputRequest(string FullName, string MobileNumber, string Relationship, string? SaIdNumber);
public record UpsertContactsRequest(List<ContactInputRequest> Contacts);
public record RequestGrantRequest(Guid ContactId);
