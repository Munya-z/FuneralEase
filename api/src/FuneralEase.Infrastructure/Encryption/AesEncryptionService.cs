using System.Security.Cryptography;
using System.Text;

namespace FuneralEase.Infrastructure.Encryption;

public static class AesEncryptionService
{
    public static string Encrypt(string plaintext, string base64Key)
    {
        if (string.IsNullOrEmpty(plaintext)) return plaintext;

        var key = Convert.FromBase64String(base64Key);
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);

        // Format: IV (16 bytes) + ciphertext, base64-encoded
        var combined = new byte[aes.IV.Length + ciphertext.Length];
        Buffer.BlockCopy(aes.IV, 0, combined, 0, aes.IV.Length);
        Buffer.BlockCopy(ciphertext, 0, combined, aes.IV.Length, ciphertext.Length);
        return Convert.ToBase64String(combined);
    }

    public static string Decrypt(string cipherBase64, string base64Key)
    {
        if (string.IsNullOrEmpty(cipherBase64)) return cipherBase64;

        var key = Convert.FromBase64String(base64Key);
        var combined = Convert.FromBase64String(cipherBase64);

        using var aes = Aes.Create();
        aes.Key = key;

        var iv = new byte[16];
        Buffer.BlockCopy(combined, 0, iv, 0, iv.Length);
        aes.IV = iv;

        var ciphertext = new byte[combined.Length - iv.Length];
        Buffer.BlockCopy(combined, iv.Length, ciphertext, 0, ciphertext.Length);

        using var decryptor = aes.CreateDecryptor();
        var plaintextBytes = decryptor.TransformFinalBlock(ciphertext, 0, ciphertext.Length);
        return Encoding.UTF8.GetString(plaintextBytes);
    }
}
