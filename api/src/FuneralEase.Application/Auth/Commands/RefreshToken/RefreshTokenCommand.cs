using FuneralEase.Application.Common.Interfaces;
using MediatR;

namespace FuneralEase.Application.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<TokenPair>;
