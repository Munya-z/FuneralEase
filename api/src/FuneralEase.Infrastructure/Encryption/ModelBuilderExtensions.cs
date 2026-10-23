using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Infrastructure.Encryption;

public static class ModelBuilderExtensions
{
    private const string EncryptionKeyAnnotation = "EncryptionKey";

    public static ModelBuilder UseEncryptionKey(this ModelBuilder modelBuilder, string key)
    {
        modelBuilder.HasAnnotation(EncryptionKeyAnnotation, key);
        return modelBuilder;
    }

    public static string? GetEncryptionKey(this ModelBuilder modelBuilder) =>
        modelBuilder.Model.FindAnnotation(EncryptionKeyAnnotation)?.Value as string;
}
