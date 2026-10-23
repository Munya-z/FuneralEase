namespace FuneralEase.Application.Common.Interfaces;

public interface IOtpService
{
    Task SendOtpAsync(string mobileNumber, CancellationToken cancellationToken = default);
    Task<bool> VerifyOtpAsync(string mobileNumber, string code, CancellationToken cancellationToken = default);
}
