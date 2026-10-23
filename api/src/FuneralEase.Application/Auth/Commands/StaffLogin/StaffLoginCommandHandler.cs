using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using MediatR;

namespace FuneralEase.Application.Auth.Commands.StaffLogin;

public class StaffLoginCommandHandler(
    IJwtTokenService jwtTokenService,
    IStaffCredentialValidator credentialValidator) : IRequestHandler<StaffLoginCommand, TokenPair>
{
    // Stable synthetic identity for staff JWTs (not a household user).
    private static readonly UserId StaffUserId = new(Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

    public Task<TokenPair> Handle(StaffLoginCommand request, CancellationToken cancellationToken)
    {
        if (!credentialValidator.TryValidate(request.Email, request.Password, request.Totp, out var error))
            throw new ForbiddenException(error);

        var tokens = jwtTokenService.GenerateTokenPair(
            StaffUserId,
            HouseholdId.Empty,
            MemberRole.Administrator,
            fullName: "Staff Admin",
            isAdmin: true);

        return Task.FromResult(tokens);
    }
}
