using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using Xunit;

namespace FuneralEase.Domain.Tests.Claims;

public class ClaimTests
{
    private static readonly List<(string description, ChecklistItemType type)> Template =
    [
        ("Death certificate", ChecklistItemType.Required),
        ("ID document", ChecklistItemType.Required),
        ("Burial order", ChecklistItemType.Optional),
    ];

    private static Claim CreateClaim() =>
        Claim.Create(PolicyId.New(), HouseholdId.New(), "John Doe", Template);

    [Fact]
    public void Create_ShouldBuildChecklistFromTemplate()
    {
        var claim = CreateClaim();

        Assert.Equal(ClaimStatus.InProgress, claim.Status);
        Assert.Equal(3, claim.ChecklistItems.Count);
        Assert.Equal(2, claim.ChecklistItems.Count(i => i.ItemType == ChecklistItemType.Required));
    }

    [Fact]
    public void Complete_WithAllRequiredChecked_ShouldSetStatusToSubmitted()
    {
        var claim = CreateClaim();

        foreach (var item in claim.ChecklistItems.Where(i => i.ItemType == ChecklistItemType.Required))
            claim.UpdateChecklistItem(item.Id, true);

        claim.Complete();

        Assert.Equal(ClaimStatus.Submitted, claim.Status);
        Assert.NotNull(claim.SubmittedAt);
    }

    [Fact]
    public void Complete_WithMissingRequiredItems_ShouldThrow()
    {
        var claim = CreateClaim();

        Assert.Throws<InvalidOperationException>(() => claim.Complete());
    }

    [Fact]
    public void Complete_WhenAlreadySubmitted_ShouldThrow()
    {
        var claim = CreateClaim();

        foreach (var item in claim.ChecklistItems.Where(i => i.ItemType == ChecklistItemType.Required))
            claim.UpdateChecklistItem(item.Id, true);

        claim.Complete();

        Assert.Throws<InvalidOperationException>(() => claim.Complete());
    }

    [Fact]
    public void UpdateChecklistItem_WhenSubmitted_ShouldThrow()
    {
        var claim = CreateClaim();

        foreach (var item in claim.ChecklistItems.Where(i => i.ItemType == ChecklistItemType.Required))
            claim.UpdateChecklistItem(item.Id, true);

        claim.Complete();

        var anyItem = claim.ChecklistItems.First();
        Assert.Throws<InvalidOperationException>(() => claim.UpdateChecklistItem(anyItem.Id, false));
    }

    [Fact]
    public void UpdateChecklistItem_WithUnknownItemId_ShouldThrow()
    {
        var claim = CreateClaim();

        Assert.Throws<InvalidOperationException>(() =>
            claim.UpdateChecklistItem(ChecklistItemId.New(), true));
    }

    [Fact]
    public void OptionalItems_NotChecked_ShouldNotBlockCompletion()
    {
        var claim = CreateClaim();

        foreach (var item in claim.ChecklistItems.Where(i => i.ItemType == ChecklistItemType.Required))
            claim.UpdateChecklistItem(item.Id, true);
        // Optional "Burial order" not checked

        claim.Complete(); // Should not throw

        Assert.Equal(ClaimStatus.Submitted, claim.Status);
    }
}
