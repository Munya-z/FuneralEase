using FuneralEase.Api.Extensions;
using FuneralEase.Application.BurialSocieties.Commands.AddSocietyMember;
using FuneralEase.Application.BurialSocieties.Commands.CreateBurialSociety;
using FuneralEase.Application.BurialSocieties.Commands.RecordContribution;
using FuneralEase.Application.BurialSocieties.Queries.GetBurialSociety;
using FuneralEase.Application.BurialSocieties.Queries.GetMyContributions;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("burial-societies")]
[Authorize(Policy = "HouseholdMember")]
public class BurialSocietiesController(ISender sender) : ControllerBase
{
    /// <summary>Get the burial society for the calling household (admin or member).</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMySociety(CancellationToken ct)
    {
        var result = await sender.Send(new GetBurialSocietyQuery(User.GetHouseholdId()), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    /// <summary>Create a new burial society administered by the calling household.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBurialSocietyRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new CreateBurialSocietyCommand(
            User.GetHouseholdId(),
            request.Name,
            request.MonthlyContributionAmount,
            request.RegistrationNumber), ct);
        return CreatedAtAction(nameof(GetMySociety), result);
    }

    /// <summary>Admin only: add a member household to the society.</summary>
    [HttpPost("{id:guid}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddSocietyMemberRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new AddSocietyMemberCommand(
            new BurialSocietyId(id),
            User.GetHouseholdId(),
            new HouseholdId(request.MemberHouseholdId),
            request.FullName,
            request.MobileNumber), ct);
        return Ok(result);
    }

    /// <summary>Returns the calling household member's full contribution history for this society.</summary>
    [HttpGet("{id:guid}/my-contributions")]
    public async Task<IActionResult> GetMyContributions(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetMyContributionsQuery(new BurialSocietyId(id), User.GetHouseholdId()), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    /// <summary>Record a contribution payment for a member for a given period.</summary>
    [HttpPost("{id:guid}/contributions")]
    public async Task<IActionResult> RecordContribution(Guid id, [FromBody] RecordContributionRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new RecordContributionCommand(
            new BurialSocietyId(id),
            User.GetHouseholdId(),
            request.MemberId,
            request.AmountPaid,
            request.Period,
            request.Note), ct);
        return Ok(result);
    }
}

public record CreateBurialSocietyRequest(string Name, decimal MonthlyContributionAmount, string? RegistrationNumber);
public record AddSocietyMemberRequest(Guid MemberHouseholdId, string FullName, string MobileNumber);
public record RecordContributionRequest(Guid MemberId, decimal AmountPaid, string Period, string? Note);
