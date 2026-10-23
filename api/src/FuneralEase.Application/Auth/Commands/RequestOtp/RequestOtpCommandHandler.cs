using FuneralEase.Application.Common.Interfaces;
using MediatR;

namespace FuneralEase.Application.Auth.Commands.RequestOtp;

public class RequestOtpCommandHandler(IOtpService otpService) : IRequestHandler<RequestOtpCommand>
{
    public async Task Handle(RequestOtpCommand request, CancellationToken cancellationToken)
    {
        // No oracle leakage: always returns success, even for unknown numbers
        await otpService.SendOtpAsync(request.MobileNumber, cancellationToken);
    }
}
