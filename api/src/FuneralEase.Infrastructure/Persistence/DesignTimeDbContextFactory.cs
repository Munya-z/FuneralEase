using FuneralEase.Infrastructure.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql("Host=localhost;Database=funeralease;Username=funeralease;Password=funeralease_dev")
            .Options;

        // Provide a dummy encryption key (32 bytes = 256-bit, base64-encoded) for design-time
        var encryptionOptions = Options.Create(new EncryptionOptions
        {
            Key = Convert.ToBase64String(new byte[32])
        });

        return new ApplicationDbContext(options, encryptionOptions);
    }
}
