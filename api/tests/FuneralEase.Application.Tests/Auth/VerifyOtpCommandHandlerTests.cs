using FuneralEase.Application.Auth.Commands.VerifyOtp;
using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using Moq;
using Xunit;

namespace FuneralEase.Application.Tests.Auth;

public class VerifyOtpCommandHandlerTests
{
    private readonly Mock<IOtpService> _otpServiceMock = new();
    private readonly Mock<IApplicationDbContext> _dbMock = new();
    private readonly Mock<IJwtTokenService> _jwtMock = new();

    [Fact]
    public async Task Handle_WithInvalidOtp_ShouldThrowForbidden()
    {
        _otpServiceMock
            .Setup(s => s.VerifyOtpAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new VerifyOtpCommandHandler(_otpServiceMock.Object, _dbMock.Object, _jwtMock.Object);
        var command = new VerifyOtpCommand("+27821234567", "999999", "Test User");

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(command, CancellationToken.None));
    }
}
