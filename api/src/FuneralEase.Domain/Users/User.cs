using System.Security.Cryptography;
using System.Text;
using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Users;

public class User : AggregateRoot<UserId>
{
    public string MobileNumber { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public HouseholdId? PrimaryHouseholdId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset LastLoginAt { get; private set; }
    /// <summary>POPIA §18 — records the moment the user gave explicit consent.</summary>
    public DateTimeOffset? PopiaConsentGivenAt { get; private set; }
    public string? PinHash { get; private set; }

    private User() { }

    public void SetPin(string pin)
    {
        PinHash = HashPin(MobileNumber, pin);
    }

    public bool VerifyPin(string pin)
    {
        if (PinHash is null) return false;
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(PinHash),
            Encoding.UTF8.GetBytes(HashPin(MobileNumber, pin)));
    }

    private static string HashPin(string mobileNumber, string pin)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(
            pin,
            Encoding.UTF8.GetBytes(mobileNumber),
            100_000,
            HashAlgorithmName.SHA256);
        return Convert.ToBase64String(pbkdf2.GetBytes(32));
    }

    public static User Create(string mobileNumber, string fullName, bool popiaConsentGiven)
    {
        Guard.NotNullOrEmpty(mobileNumber, nameof(mobileNumber));
        Guard.NotNullOrEmpty(fullName, nameof(fullName));
        if (!popiaConsentGiven)
            throw new InvalidOperationException("POPIA consent is required to create an account.");

        return new User
        {
            Id = UserId.New(),
            MobileNumber = mobileNumber,
            FullName = fullName,
            CreatedAt = DateTimeOffset.UtcNow,
            LastLoginAt = DateTimeOffset.UtcNow,
            PopiaConsentGivenAt = DateTimeOffset.UtcNow
        };
    }

    public void SetPrimaryHousehold(HouseholdId householdId) =>
        PrimaryHouseholdId = householdId;

    public void RecordLogin() => LastLoginAt = DateTimeOffset.UtcNow;

    public void UpdateProfile(string fullName)
    {
        FullName = Guard.NotNullOrEmpty(fullName, nameof(fullName));
    }
}
