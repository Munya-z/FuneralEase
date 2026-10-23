namespace FuneralEase.Infrastructure.Auth;

public class AdminOptions
{
    public const string SectionName = "Admin";

    /// <summary>Staff email allowed to sign into the admin portal.</summary>
    public string StaffEmail { get; set; } = "admin@funeralease.co.za";

    /// <summary>Plaintext staff password (override via env in production).</summary>
    public string StaffPassword { get; set; } = "ChangeMeNow!";

    /// <summary>When true, a 6-digit TOTP/static code is required after password.</summary>
    public bool RequireTotp { get; set; }

    /// <summary>Static staff code used when RequireTotp is true (replace with real TOTP later).</summary>
    public string StaffTotp { get; set; } = "";
}
