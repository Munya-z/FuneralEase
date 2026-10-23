using FuneralEase.Api.Extensions;
using FuneralEase.Application.Policies.Commands.AddBeneficiary;
using FuneralEase.Application.Policies.Commands.CreatePolicy;
using FuneralEase.Application.Policies.Commands.MarkPremiumPaid;
using FuneralEase.Application.Policies.Commands.RemoveBeneficiary;
using FuneralEase.Application.Policies.Commands.UpdatePolicy;
using FuneralEase.Application.Policies.Commands.UploadPolicyDocument;
using FuneralEase.Application.Policies.Queries.GetCoverageAnalysis;
using FuneralEase.Application.Policies.Queries.GetDocumentDownloadUrl;
using FuneralEase.Application.Policies.Queries.GetPaymentHistory;
using FuneralEase.Application.Policies.Queries.GetPolicies;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("policies")]
[Authorize(Policy = "HouseholdMember")]
public class PoliciesController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPolicies(CancellationToken ct)
    {
        var result = await sender.Send(new GetPoliciesQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePolicy([FromBody] CreatePolicyRequest request, CancellationToken ct)
    {
        var command = new CreatePolicyCommand(User.GetHouseholdId(), request.InsurerName, request.PolicyNumber, request.PremiumAmount, request.NextDueDate);
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetPolicies), new { id = result.Id }, result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdatePolicy(Guid id, [FromBody] UpdatePolicyRequest request, CancellationToken ct)
    {
        var command = new UpdatePolicyCommand(new PolicyId(id), User.GetHouseholdId(), request.InsurerName, request.PolicyNumber, request.PremiumAmount, request.NextDueDate);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkPaid(Guid id, [FromBody] MarkPaidRequest request, CancellationToken ct)
    {
        await sender.Send(new MarkPremiumPaidCommand(new PolicyId(id), User.GetHouseholdId(), request.PaidForDate), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/documents")]
    public async Task<IActionResult> RequestDocumentUpload(Guid id, [FromBody] DocumentUploadRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new UploadPolicyDocumentCommand(new PolicyId(id), User.GetHouseholdId(), request.FileName, request.ContentType), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/payment-history")]
    public async Task<IActionResult> GetPaymentHistory(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetPaymentHistoryQuery(new PolicyId(id), User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/documents/download-url")]
    public async Task<IActionResult> GetDocumentDownloadUrl(Guid id, [FromQuery] string storageKey, CancellationToken ct)
    {
        var result = await sender.Send(new GetDocumentDownloadUrlQuery(new PolicyId(id), User.GetHouseholdId(), storageKey), ct);
        return Ok(result);
    }

    /// <summary>Add a beneficiary to a policy. Total allocation must not exceed 100%.</summary>
    [HttpPost("{id:guid}/beneficiaries")]
    public async Task<IActionResult> AddBeneficiary(Guid id, [FromBody] AddBeneficiaryRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new AddBeneficiaryCommand(new PolicyId(id), User.GetHouseholdId(), request.FullName, request.Relationship, request.BenefitPercentage), ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}/beneficiaries/{beneficiaryId:guid}")]
    public async Task<IActionResult> RemoveBeneficiary(Guid id, Guid beneficiaryId, CancellationToken ct)
    {
        var result = await sender.Send(new RemoveBeneficiaryCommand(new PolicyId(id), User.GetHouseholdId(), beneficiaryId), ct);
        return Ok(result);
    }

    [HttpGet("coverage-analysis")]
    public async Task<IActionResult> GetCoverageAnalysis(CancellationToken ct)
    {
        var result = await sender.Send(new GetCoverageAnalysisQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }
}

public record CreatePolicyRequest(string InsurerName, string PolicyNumber, decimal PremiumAmount, DateOnly NextDueDate);
public record UpdatePolicyRequest(string InsurerName, string PolicyNumber, decimal PremiumAmount, DateOnly NextDueDate);
public record MarkPaidRequest(DateOnly PaidForDate);
public record DocumentUploadRequest(string FileName, string ContentType);
public record AddBeneficiaryRequest(string FullName, string Relationship, decimal BenefitPercentage);
