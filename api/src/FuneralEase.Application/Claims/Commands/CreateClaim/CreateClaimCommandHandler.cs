using FuneralEase.Application.Claims.DTOs;
using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Commands.CreateClaim;

public class CreateClaimCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateClaimCommand, ClaimDto>
{
    // Base items required by all insurers
    private static readonly List<(string description, ChecklistItemType type)> BaseTemplate =
    [
        ("Certified copy of deceased's ID document", ChecklistItemType.Required),
        ("Original death certificate", ChecklistItemType.Required),
        ("Claimant's ID document (certified copy)", ChecklistItemType.Required),
        ("Proof of relationship to deceased", ChecklistItemType.Required),
        ("Bank account details for payout", ChecklistItemType.Required),
        ("Police report (if death was unnatural)", ChecklistItemType.Optional),
        ("Burial/cremation order", ChecklistItemType.Optional),
    ];

    // Insurer-specific extra items keyed by normalised insurer name substring (lowercase)
    private static readonly Dictionary<string, List<(string description, ChecklistItemType type)>> InsurerExtras = new()
    {
        ["old mutual"] =
        [
            ("Completed Old Mutual claim form (OM1234)", ChecklistItemType.Required),
            ("Old Mutual policy schedule", ChecklistItemType.Required),
        ],
        ["sanlam"] =
        [
            ("Completed Sanlam Funeral Plan claim form", ChecklistItemType.Required),
            ("Sanlam policy number confirmation letter", ChecklistItemType.Required),
        ],
        ["1life"] =
        [
            ("Completed 1Life claim notification form", ChecklistItemType.Required),
        ],
        ["momentum"] =
        [
            ("Completed Momentum claim form", ChecklistItemType.Required),
            ("Momentum membership/policy certificate", ChecklistItemType.Required),
        ],
        ["assupol"] =
        [
            ("Completed Assupol claim form", ChecklistItemType.Required),
            ("Assupol policy schedule", ChecklistItemType.Required),
        ],
        ["clientele"] =
        [
            ("Completed Clientele Life claim form", ChecklistItemType.Required),
        ],
    };

    private static List<(string description, ChecklistItemType type)> BuildTemplate(string insurerName)
    {
        var template = new List<(string, ChecklistItemType)>(BaseTemplate);
        var key = InsurerExtras.Keys.FirstOrDefault(k => insurerName.Contains(k, StringComparison.OrdinalIgnoreCase));
        if (key is not null)
            template.InsertRange(1, InsurerExtras[key]); // insurer form after ID doc
        else
            template.Insert(1, ($"Completed claim form from {insurerName}", ChecklistItemType.Required));
        return template;
    }

    public async Task<ClaimDto> Handle(CreateClaimCommand request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Policies.Policy), request.PolicyId);

        var template = BuildTemplate(policy.InsurerName);
        var claim = Claim.Create(request.PolicyId, request.HouseholdId, request.DeceasedFullName, template);
        db.Claims.Add(claim);
        await db.SaveChangesAsync(cancellationToken);
        return claim.ToDto();
    }
}
