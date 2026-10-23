namespace FuneralEase.Application.Common.Interfaces;

public interface IStaffCredentialValidator
{
    /// <summary>Validates staff portal credentials. Returns false with an error message on failure.</summary>
    bool TryValidate(string email, string password, string? totp, out string error);
}
