using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FuneralEase.Infrastructure.Auth;

/// <summary>
/// Stub OTP service. In production: replace with Twilio Verify or similar.
/// </summary>
public class OtpService(ILogger<OtpService> logger) : IOtpService
{
    // In-memory store for dev/test. Replace with Redis or similar in prod.
    private static readonly Dictionary<string, (string Code, DateTimeOffset Expires)> OtpStore = new();

    public Task SendOtpAsync(string mobileNumber, CancellationToken cancellationToken = default)
    {
        var code = new Random().Next(100000, 999999).ToString();
        OtpStore[mobileNumber] = (code, DateTimeOffset.UtcNow.AddMinutes(10));

        // In production: send via Twilio Verify
        logger.LogInformation("OTP for {MobileNumber}: {Code}", mobileNumber, code);

        return Task.CompletedTask;
    }

    public Task<bool> VerifyOtpAsync(string mobileNumber, string code, CancellationToken cancellationToken = default)
    {
        if (!OtpStore.TryGetValue(mobileNumber, out var stored))
            return Task.FromResult(false);

        if (stored.Expires < DateTimeOffset.UtcNow)
        {
            OtpStore.Remove(mobileNumber);
            return Task.FromResult(false);
        }

        var valid = stored.Code == code;
        if (valid) OtpStore.Remove(mobileNumber);

        return Task.FromResult(valid);
    }
}
