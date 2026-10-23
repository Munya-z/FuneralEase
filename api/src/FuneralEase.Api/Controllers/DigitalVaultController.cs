using FuneralEase.Api.Extensions;
using FuneralEase.Application.DigitalVault.Commands;
using FuneralEase.Application.DigitalVault.Queries;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.DigitalVault;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("digital-vault")]
[Authorize(Policy = "HouseholdMember")]
public class DigitalVaultController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAssets(CancellationToken ct)
    {
        var result = await sender.Send(new GetDigitalAssetsQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsset([FromBody] CreateDigitalAssetRequest request, CancellationToken ct)
    {
        var command = new CreateDigitalAssetCommand(
            User.GetHouseholdId(),
            request.Category,
            request.ServiceName,
            request.Username,
            request.Notes,
            request.Url,
            request.OnDeathInstruction);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetAssets), new { }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAsset(Guid id, [FromBody] UpdateDigitalAssetRequest request, CancellationToken ct)
    {
        var command = new UpdateDigitalAssetCommand(
            new DigitalAssetId(id),
            User.GetHouseholdId(),
            request.Category,
            request.ServiceName,
            request.Username,
            request.Notes,
            request.Url,
            request.OnDeathInstruction);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsset(Guid id, CancellationToken ct)
    {
        await sender.Send(new DeleteDigitalAssetCommand(new DigitalAssetId(id), User.GetHouseholdId()), ct);
        return NoContent();
    }
}

public record CreateDigitalAssetRequest(
    DigitalAssetCategory Category,
    string ServiceName,
    string? Username,
    string? Notes,
    string? Url,
    OnDeathInstruction OnDeathInstruction);

public record UpdateDigitalAssetRequest(
    DigitalAssetCategory Category,
    string ServiceName,
    string? Username,
    string? Notes,
    string? Url,
    OnDeathInstruction OnDeathInstruction);
