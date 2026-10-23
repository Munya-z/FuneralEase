using MediatR;

namespace FuneralEase.Application.Auth.Commands.SetPin;

public record SetPinCommand(string Pin) : IRequest;
