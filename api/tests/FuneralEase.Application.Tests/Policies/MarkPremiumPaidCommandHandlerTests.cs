using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Policies.Commands.MarkPremiumPaid;
using FuneralEase.Application.Tests.Helpers;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;
using Moq;
using Xunit;

namespace FuneralEase.Application.Tests.Policies;

public class MarkPremiumPaidCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _dbMock = new();

    [Fact]
    public async Task Handle_ValidPolicy_ShouldMarkPremiumPaid()
    {
        var householdId = HouseholdId.New();
        var policy = Policy.Create(householdId, "Sanlam", "POL-001", 250m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)));
        policy.Escalate();

        var policies = new List<Policy> { policy }.AsQueryable();
        var paymentRecords = new List<PremiumPaymentRecord>().AsQueryable();
        _dbMock.Setup(d => d.Policies).Returns(MockDbSetHelper.CreateMockDbSet(policies).Object);
        _dbMock.Setup(d => d.PremiumPaymentRecords).Returns(MockDbSetHelper.CreateMockDbSet(paymentRecords).Object);
        _dbMock.Setup(d => d.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var handler = new MarkPremiumPaidCommandHandler(_dbMock.Object);
        var command = new MarkPremiumPaidCommand(policy.Id, householdId, DateOnly.FromDateTime(DateTime.UtcNow));

        await handler.Handle(command, CancellationToken.None);

        Assert.Equal(LapseStatus.Current, policy.LapseStatus);
        _dbMock.Verify(d => d.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PolicyNotBelongingToHousehold_ShouldThrowNotFound()
    {
        var householdId = HouseholdId.New();
        var differentHouseholdId = HouseholdId.New();
        var policy = Policy.Create(differentHouseholdId, "Sanlam", "POL-001", 250m, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)));

        var policies = new List<Policy> { policy }.AsQueryable();
        _dbMock.Setup(d => d.Policies).Returns(MockDbSetHelper.CreateMockDbSet(policies).Object);

        var handler = new MarkPremiumPaidCommandHandler(_dbMock.Object);
        var command = new MarkPremiumPaidCommand(policy.Id, householdId, DateOnly.FromDateTime(DateTime.UtcNow));

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }
}
