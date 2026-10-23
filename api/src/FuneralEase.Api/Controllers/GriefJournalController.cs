using FuneralEase.Api.Extensions;
using FuneralEase.Application.GriefJournal.Commands;
using FuneralEase.Application.GriefJournal.Queries;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.GriefJournal;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("grief-journal")]
[Authorize(Policy = "HouseholdMember")]
public class GriefJournalController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEntries(CancellationToken ct)
    {
        var result = await sender.Send(new GetJournalEntriesQuery(User.GetUserId(), User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEntry([FromBody] CreateJournalEntryRequest request, CancellationToken ct)
    {
        var command = new CreateJournalEntryCommand(
            User.GetUserId(),
            User.GetHouseholdId(),
            request.Content,
            request.Mood);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetEntries), new { }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] UpdateJournalEntryRequest request, CancellationToken ct)
    {
        var command = new UpdateJournalEntryCommand(
            new GriefJournalEntryId(id),
            User.GetUserId(),
            User.GetHouseholdId(),
            request.Content,
            request.Mood);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEntry(Guid id, CancellationToken ct)
    {
        await sender.Send(new DeleteJournalEntryCommand(new GriefJournalEntryId(id), User.GetUserId(), User.GetHouseholdId()), ct);
        return NoContent();
    }
}

public record CreateJournalEntryRequest(string Content, JournalMood Mood);
public record UpdateJournalEntryRequest(string Content, JournalMood Mood);
