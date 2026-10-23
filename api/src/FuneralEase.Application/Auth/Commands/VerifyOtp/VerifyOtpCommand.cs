using FuneralEase.Application.Common.Interfaces;
using MediatR;

namespace FuneralEase.Application.Auth.Commands.VerifyOtp;

public record VerifyOtpCommand(string MobileNumber, string Code, string FullName, bool PopiaConsentGiven = false) : IRequest<TokenPair>;
