using FluentValidation;
using FuneralEase.Application.Auth.Commands.RequestOtp;
using FuneralEase.Application.Common.Behaviors;
using MediatR;
using Xunit;
using ValidationException = FuneralEase.Application.Common.Exceptions.ValidationException;

namespace FuneralEase.Application.Tests.Common;

public class ValidationBehaviorTests
{
    [Fact]
    public async Task Handle_WithValidRequest_ShouldCallNext()
    {
        var validators = new[] { new RequestOtpCommandValidator() };
        var behavior = new ValidationBehavior<RequestOtpCommand, Unit>(validators);

        var called = false;
        Task<Unit> Next() { called = true; return Task.FromResult(Unit.Value); }

        await behavior.Handle(new RequestOtpCommand("+27821234567"), Next, CancellationToken.None);

        Assert.True(called);
    }

    [Fact]
    public async Task Handle_WithInvalidRequest_ShouldThrowValidationException()
    {
        var validators = new[] { new RequestOtpCommandValidator() };
        var behavior = new ValidationBehavior<RequestOtpCommand, Unit>(validators);

        await Assert.ThrowsAsync<ValidationException>(() =>
            behavior.Handle(
                new RequestOtpCommand("not-a-phone"),
                () => Task.FromResult(Unit.Value),
                CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithNoValidators_ShouldCallNext()
    {
        var behavior = new ValidationBehavior<RequestOtpCommand, Unit>([]);

        var called = false;
        await behavior.Handle(new RequestOtpCommand(""), () => { called = true; return Task.FromResult(Unit.Value); }, CancellationToken.None);

        Assert.True(called);
    }
}
