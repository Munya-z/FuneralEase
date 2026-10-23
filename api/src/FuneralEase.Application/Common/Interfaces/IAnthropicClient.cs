namespace FuneralEase.Application.Common.Interfaces;

public interface IAnthropicClient
{
    bool IsConfigured { get; }

    Task<string> GenerateObituaryAsync(string prompt, CancellationToken cancellationToken = default);
}
