using FuneralEase.Application.Common.Interfaces;
using MediatR;

namespace FuneralEase.Application.Auth.Commands.StaffLogin;

public record StaffLoginCommand(
    string Email,
    string Password,
    string? Totp = null) : IRequest<TokenPair>;
