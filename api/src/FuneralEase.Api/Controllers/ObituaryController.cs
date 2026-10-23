using FuneralEase.Api.Extensions;
using FuneralEase.Application.Obituaries.Commands;
using FuneralEase.Application.Obituaries.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("obituary")]
[Authorize(Policy = "HouseholdMember")]
public class ObituaryController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetObituary(CancellationToken ct)
    {
        var result = await sender.Send(new GetObituaryQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateObituary([FromBody] GenerateObituaryRequest request, CancellationToken ct)
    {
        var command = new GenerateObituaryCommand(
            User.GetHouseholdId(),
            request.DeceasedFullName,
            request.AgeAtDeath,
            request.DateOfBirth,
            request.DateOfDeath,
            request.Occupation,
            request.Hometown,
            request.SurvivedBy,
            request.LifeHighlights,
            request.TonePreference);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> SaveObituary([FromBody] SaveObituaryRequest request, CancellationToken ct)
    {
        var command = new SaveObituaryCommand(
            User.GetHouseholdId(),
            request.DeceasedFullName,
            request.Content);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }
}

public record GenerateObituaryRequest(
    string DeceasedFullName,
    int? AgeAtDeath,
    DateOnly? DateOfBirth,
    DateOnly? DateOfDeath,
    string? Occupation,
    string? Hometown,
    string? SurvivedBy,
    string? LifeHighlights,
    TonePreference TonePreference);

public record SaveObituaryRequest(string DeceasedFullName, string Content);
