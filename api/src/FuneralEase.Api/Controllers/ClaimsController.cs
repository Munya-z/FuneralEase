using FuneralEase.Api.Extensions;
using FuneralEase.Application.Claims.Commands.CompleteClaim;
using FuneralEase.Application.Claims.Commands.CreateClaim;
using FuneralEase.Application.Claims.Commands.UpdateChecklistItem;
using FuneralEase.Application.Claims.Commands.UploadClaimDocument;
using FuneralEase.Application.Claims.Queries.GetClaimChecklist;
using FuneralEase.Application.Claims.Queries.GetClaimDocumentDownloadUrl;
using FuneralEase.Application.Claims.Queries.GetClaims;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("claims")]
[Authorize(Policy = "HouseholdMember")]
public class ClaimsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetClaims(CancellationToken ct)
    {
        var result = await sender.Send(new GetClaimsQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClaim([FromBody] CreateClaimRequest request, CancellationToken ct)
    {
        var command = new CreateClaimCommand(new PolicyId(request.PolicyId), User.GetHouseholdId(), request.DeceasedFullName);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetChecklist), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}/checklist")]
    public async Task<IActionResult> GetChecklist(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetClaimChecklistQuery(new ClaimId(id), User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/checklist/{itemId:guid}")]
    public async Task<IActionResult> UpdateChecklistItem(Guid id, Guid itemId, [FromBody] UpdateChecklistItemRequest request, CancellationToken ct)
    {
        await sender.Send(new UpdateChecklistItemCommand(new ClaimId(id), new ChecklistItemId(itemId), User.GetHouseholdId(), request.IsChecked), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> CompleteClaim(Guid id, CancellationToken ct)
    {
        await sender.Send(new CompleteClaimCommand(new ClaimId(id), User.GetHouseholdId()), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/documents")]
    public async Task<IActionResult> RequestDocumentUpload(Guid id, [FromBody] ClaimDocumentUploadRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new UploadClaimDocumentCommand(new ClaimId(id), User.GetHouseholdId(), request.FileName, request.ContentType), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/documents/download-url")]
    public async Task<IActionResult> GetDocumentDownloadUrl(Guid id, [FromQuery] string storageKey, CancellationToken ct)
    {
        var result = await sender.Send(new GetClaimDocumentDownloadUrlQuery(new ClaimId(id), User.GetHouseholdId(), storageKey), ct);
        return Ok(result);
    }
}

public record CreateClaimRequest(Guid PolicyId, string DeceasedFullName);
public record UpdateChecklistItemRequest(bool IsChecked);
public record ClaimDocumentUploadRequest(string FileName, string ContentType);
