using FuneralEase.Api.Extensions;
using FuneralEase.Application.EstateChecklist.Commands;
using FuneralEase.Application.EstateChecklist.Queries;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.EstateChecklist;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("estate-checklist")]
[Authorize(Policy = "HouseholdMember")]
public class EstateChecklistController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetChecklist(CancellationToken ct)
    {
        var result = await sender.Send(new GetEstateChecklistQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateChecklist([FromBody] CreateEstateChecklistRequest request, CancellationToken ct)
    {
        var command = new CreateEstateChecklistCommand(
            User.GetHouseholdId(),
            request.DeceasedFullName,
            request.DateOfDeath);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetChecklist), new { }, result);
    }

    [HttpPatch("tasks/{taskId:guid}")]
    public async Task<IActionResult> CompleteTask(Guid taskId, [FromBody] CompleteEstateTaskRequest request, CancellationToken ct)
    {
        var command = new CompleteEstateTaskCommand(
            new EstateChecklistId(request.ChecklistId),
            new EstateTaskId(taskId),
            User.GetHouseholdId(),
            request.IsCompleted);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> AddCustomTask([FromBody] AddCustomTaskRequest request, CancellationToken ct)
    {
        var command = new AddCustomTaskCommand(
            new EstateChecklistId(request.ChecklistId),
            User.GetHouseholdId(),
            request.Title,
            request.Description,
            request.Category);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetChecklist), new { }, result);
    }
}

public record CreateEstateChecklistRequest(string DeceasedFullName, DateOnly DateOfDeath);
public record CompleteEstateTaskRequest(Guid ChecklistId, bool IsCompleted);
public record AddCustomTaskRequest(Guid ChecklistId, string Title, string Description, EstateTaskCategory Category);
