using FuneralEase.Api.Extensions;
using FuneralEase.Application.Fundraisers.Commands;
using FuneralEase.Application.Fundraisers.Queries;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("fundraisers")]
public class FundraisersController(ISender sender) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> GetFundraisers(CancellationToken ct)
    {
        var result = await sender.Send(new GetFundraisersQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> CreateFundraiser([FromBody] CreateFundraiserRequest request, CancellationToken ct)
    {
        var command = new CreateFundraiserCommand(
            User.GetHouseholdId(),
            request.Title,
            request.Story,
            request.GoalAmount,
            request.DeceasedFullName);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetFundraiserDetail), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFundraiserDetail(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetFundraiserDetailQuery(new FundraiserId(id)), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/contribute")]
    [AllowAnonymous]
    public async Task<IActionResult> Contribute(Guid id, [FromBody] ContributeRequest request, CancellationToken ct)
    {
        var command = new ContributeToFundraiserCommand(
            new FundraiserId(id),
            request.DonorName,
            request.AmountCents,
            request.Message);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/close")]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new CloseFundraiserCommand(new FundraiserId(id), User.GetHouseholdId()), ct);
        return Ok(result);
    }
}

public record CreateFundraiserRequest(string Title, string Story, decimal GoalAmount, string DeceasedFullName);
public record ContributeRequest(string DonorName, int AmountCents, string? Message);
