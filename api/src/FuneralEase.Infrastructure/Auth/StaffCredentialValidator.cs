using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Auth;

public class StaffCredentialValidator(IOptions<AdminOptions> options) : IStaffCredentialValidator
{
    private readonly AdminOptions _opts = options.Value;

    public bool TryValidate(string email, string password, string? totp, out string error)
    {
        error = string.Empty;

        if (!string.Equals(email.Trim(), _opts.StaffEmail.Trim(), StringComparison.OrdinalIgnoreCase)
            || password != _opts.StaffPassword)
        {
            error = "Invalid email or password.";
            return false;
        }

        if (_opts.RequireTotp)
        {
            if (string.IsNullOrWhiteSpace(_opts.StaffTotp)
                || !string.Equals(totp?.Trim(), _opts.StaffTotp.Trim(), StringComparison.Ordinal))
            {
                error = "Invalid authenticator code.";
                return false;
            }
        }

        return true;
    }
}
