using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.Commands.CreatePolicy;
using FuneralEase.Application.Tests.Helpers;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;
using FuneralEase.Domain.Subscriptions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace FuneralEase.Application.Tests.Policies;

public class CreatePolicyCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _dbMock = new();

    [Fact]
    public async Task Handle_FreeTierWithNoExistingPolicies_ShouldCreatePolicy()
    {
        var householdId = HouseholdId.New();
        var subscription = Subscription.CreateFree(householdId);

        SetupSubscription(householdId, subscription);
        SetupPoliciesCount(householdId, 0);

        _dbMock.Setup(d => d.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var handler = new CreatePolicyCommandHandler(_dbMock.Object);
        var command = new CreatePolicyCommand(householdId, "Sanlam", "POL-001", 250m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)));

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Sanlam", result.InsurerName);
    }

    [Fact]
    public async Task Handle_FreeTierWithOneExistingPolicy_ShouldThrowForbidden()
    {
        var householdId = HouseholdId.New();
        var subscription = Subscription.CreateFree(householdId);

        SetupSubscription(householdId, subscription);
        SetupPoliciesCount(householdId, 1);

        var handler = new CreatePolicyCommandHandler(_dbMock.Object);
        var command = new CreatePolicyCommand(householdId, "Momentum", "POL-002", 150m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    private void SetupSubscription(HouseholdId householdId, Subscription subscription)
    {
        var subscriptions = new List<Subscription> { subscription }.AsQueryable();
        _dbMock.Setup(d => d.Subscriptions).Returns(MockDbSetHelper.CreateMockDbSet(subscriptions).Object);
    }

    private void SetupPoliciesCount(HouseholdId householdId, int count)
    {
        var policies = Enumerable.Range(0, count)
            .Select(_ => Policy.Create(householdId, "Insurer", "POL", 100m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30))))
            .AsQueryable();
        _dbMock.Setup(d => d.Policies).Returns(MockDbSetHelper.CreateMockDbSet(policies).Object);
    }
}
