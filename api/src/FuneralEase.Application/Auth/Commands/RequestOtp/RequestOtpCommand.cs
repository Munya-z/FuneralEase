using MediatR;

namespace FuneralEase.Application.Auth.Commands.RequestOtp;

public record RequestOtpCommand(string MobileNumber) : IRequest;
