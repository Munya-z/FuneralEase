using FuneralEase.Application.Common.Interfaces;
using MediatR;

namespace FuneralEase.Application.Auth.Commands.LoginWithPin;

public record LoginWithPinCommand(string MobileNumber, string Pin) : IRequest<TokenPair>;
