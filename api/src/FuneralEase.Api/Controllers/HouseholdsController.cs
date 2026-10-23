using FuneralEase.Api.Extensions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Households.Commands.AddMember;
using FuneralEase.Application.Households.Commands.DeleteHousehold;
using FuneralEase.Application.Households.Commands.JoinHousehold;
using FuneralEase.Application.Households.Commands.RemoveMember;
using FuneralEase.Application.Households.Queries.ExportHouseholdData;
using FuneralEase.Application.Households.Queries.GetMembers;
using FuneralEase.Application.Households.Queries.GetReferral;
using FuneralEase.Application.Households.Queries.GetReferralConversions;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("households")]
[Authorize(Policy = "HouseholdMember")]
public class HouseholdsController(ISender sender, IAuditLogger audit) : ControllerBase
{
    /// <summary>
    /// POPIA §23 — subject access / data portability export.
    /// Returns all personal data held for the requesting household.
    /// </summary>
    [HttpGet("{householdId:guid}/data-export")]
    public async Task<IActionResult> DataExport(Guid householdId, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        var result = await sender.Send(new ExportHouseholdDataQuery(new HouseholdId(householdId)), ct);

        await audit.LogAsync(
            actor: householdId.ToString(),
            action: "POPIA_DATA_EXPORT_REQUESTED",
            category: AuditCategory.Popia,
            subject: $"Household:{householdId}",
            cancellationToken: ct);

        return Ok(result);
    }

    /// <summary>
    /// Returns the referral code and share link for a household.
    /// Also returns conversion count (number of new households that used the code).
    /// </summary>
    [HttpGet("{householdId:guid}/referral")]
    public async Task<IActionResult> GetReferral(Guid householdId, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        var result = await sender.Send(new GetReferralQuery(new HouseholdId(householdId)), ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns the list of households that joined using this household's referral code.
    /// </summary>
    [HttpGet("{householdId:guid}/referral/conversions")]
    public async Task<IActionResult> GetReferralConversions(Guid householdId, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        var result = await sender.Send(new GetReferralConversionsQuery(new HouseholdId(householdId)), ct);
        return Ok(result);
    }

    /// <summary>
    /// Records a referral conversion for the authenticated user's household.
    /// Called post-signup when the user joined via a referral link.
    /// </summary>
    [HttpPost("join")]
    public async Task<IActionResult> Join([FromBody] JoinRequest body, CancellationToken ct)
    {
        await sender.Send(new JoinHouseholdCommand(body.ReferralCode), ct);
        return NoContent();
    }

    /// <summary>Returns all members of the household.</summary>
    [HttpGet("{householdId:guid}/members")]
    public async Task<IActionResult> GetMembers(Guid householdId, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        var result = await sender.Send(new GetMembersQuery(new HouseholdId(householdId)), ct);
        return Ok(result);
    }

    /// <summary>
    /// Invites a user (by mobile number) to join the household as a member.
    /// If the user doesn't exist yet a placeholder account is created.
    /// </summary>
    [HttpPost("{householdId:guid}/members")]
    public async Task<IActionResult> AddMember(Guid householdId, [FromBody] AddMemberRequest body, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        var result = await sender.Send(
            new AddHouseholdMemberCommand(new HouseholdId(householdId), body.MobileNumber, body.FullName), ct);
        return Ok(result);
    }

    /// <summary>
    /// POPIA §17 — right to erasure. Soft-deletes the household and all associated data.
    /// The caller must be an authenticated member of the household.
    /// </summary>
    [HttpDelete("{householdId:guid}")]
    public async Task<IActionResult> DeleteHousehold(Guid householdId, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        await sender.Send(new DeleteHouseholdCommand(new HouseholdId(householdId)), ct);
        return NoContent();
    }

    /// <summary>Removes a member from the household. Administrator only.</summary>
    [HttpDelete("{householdId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid householdId, Guid userId, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        await sender.Send(
            new RemoveHouseholdMemberCommand(new HouseholdId(householdId), new UserId(userId)), ct);
        return NoContent();
    }
}

public record JoinRequest(string ReferralCode);
public record AddMemberRequest(string MobileNumber, string FullName);
