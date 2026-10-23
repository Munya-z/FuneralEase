using FuneralEase.Application.Auth.Commands.LoginWithPin;
using FuneralEase.Application.Auth.Commands.RefreshToken;
using FuneralEase.Application.Auth.Commands.RequestOtp;
using FuneralEase.Application.Auth.Commands.SetPin;
using FuneralEase.Application.Auth.Commands.StaffLogin;
using FuneralEase.Application.Auth.Commands.VerifyOtp;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("auth")]
[AllowAnonymous]
public class AuthController(ISender sender) : ControllerBase
{
    /// <summary>Staff portal login — issues a JWT with funeralease:admin scope.</summary>
    [HttpPost("staff/login")]
    public async Task<IActionResult> StaffLogin([FromBody] StaffLoginCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("otp/request")]
    public async Task<IActionResult> RequestOtp([FromBody] RequestOtpCommand command, CancellationToken ct)
    {
        await sender.Send(command, ct);
        return Ok();
    }

    [HttpPost("otp/verify")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("pin/login")]
    public async Task<IActionResult> LoginWithPin([FromBody] LoginWithPinCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("pin/set")]
    [Authorize]
    public async Task<IActionResult> SetPin([FromBody] SetPinCommand command, CancellationToken ct)
    {
        await sender.Send(command, ct);
        return NoContent();
    }
}
