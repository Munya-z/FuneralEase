using FuneralEase.Api.Extensions;
using FuneralEase.Application.Parlours.Commands.CreateParlour;
using FuneralEase.Application.Parlours.Commands.RequestAppointment;
using FuneralEase.Application.Parlours.Commands.UpdateParlour;
using FuneralEase.Application.Parlours.Queries.GetParlourByEmail;
using FuneralEase.Application.Parlours.Queries.SearchParlours;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("parlours")]
public class ParloursController(ISender sender) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string? area, [FromQuery] string? province, CancellationToken ct)
    {
        var result = await sender.Send(new SearchParloursQuery(area, province), ct);
        return Ok(result);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Submit([FromBody] CreateParlourCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(Search), new { area = result.Area }, result);
    }

    /// <summary>
    /// Look up parlour listings by contact email — used by the parlour owner dashboard.
    /// Requires the email to match the contact email on file.
    /// </summary>
    [HttpGet("my-listings")]
    [AllowAnonymous]
    public async Task<IActionResult> MyListings([FromQuery] string email, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest("Email is required.");

        var result = await sender.Send(new GetParlourByEmailQuery(email), ct);
        return Ok(result);
    }

    /// <summary>
    /// Update a parlour listing. Only the contact email owner can update.
    /// Updating an active listing puts it back into PendingReview.
    /// </summary>
    [HttpPatch("{parlourId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Update(Guid parlourId, [FromBody] UpdateParlourRequest body, CancellationToken ct)
    {
        var result = await sender.Send(
            new UpdateParlourCommand(
                new ParlourId(parlourId),
                body.ContactEmail,
                body.Name,
                body.ContactName,
                body.PhoneNumber,
                body.Area,
                body.Province,
                body.Description), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/appointments")]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> RequestAppointment(Guid id, [FromBody] RequestAppointmentRequest body, CancellationToken ct)
    {
        var command = new RequestAppointmentCommand(
            new ParlourId(id),
            User.GetHouseholdId(),
            body.ContactName,
            body.PhoneNumber,
            body.RequestedDate,
            body.Notes);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(Search), new { }, new { id = result });
    }
}

public record UpdateParlourRequest(
    string ContactEmail,
    string Name,
    string ContactName,
    string PhoneNumber,
    string Area,
    string Province,
    string? Description);

public record RequestAppointmentRequest(
    string ContactName,
    string PhoneNumber,
    DateOnly? RequestedDate,
    string? Notes);
