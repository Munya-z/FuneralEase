using FuneralEase.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace FuneralEase.Infrastructure.Anthropic;

public class AnthropicClient(
    IHttpClientFactory httpClientFactory,
    IOptions<AnthropicOptions> options,
    ILogger<AnthropicClient> logger) : IAnthropicClient
{
    private const string Model = "claude-haiku-4-5-20251001";
    private const string ApiVersion = "2023-06-01";
    private const string MessagesEndpoint = "https://api.anthropic.com/v1/messages";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(options.Value.ApiKey);

    public async Task<string> GenerateObituaryAsync(string prompt, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException(
                "Anthropic API key is not configured. Set Anthropic__ApiKey or ANTHROPIC_API_KEY.");

        var httpClient = httpClientFactory.CreateClient("Anthropic");

        var requestBody = new AnthropicMessageRequest
        {
            Model = Model,
            MaxTokens = 1024,
            Messages =
            [
                new AnthropicMessage { Role = "user", Content = prompt }
            ]
        };

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        });

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, MessagesEndpoint)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        httpRequest.Headers.Add("x-api-key", options.Value.ApiKey);
        httpRequest.Headers.Add("anthropic-version", ApiVersion);

        var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning(
                "Anthropic obituary generation failed with {StatusCode}: {Body}",
                (int)response.StatusCode,
                responseJson.Length > 400 ? responseJson[..400] : responseJson);

            throw new InvalidOperationException(
                $"Anthropic API error ({(int)response.StatusCode}). Check the API key and model access.");
        }

        var result = JsonSerializer.Deserialize<AnthropicMessageResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        });

        return result?.Content?.FirstOrDefault()?.Text
            ?? throw new InvalidOperationException("Anthropic API returned an empty response.");
    }
}

internal class AnthropicMessageRequest
{
    public string Model { get; set; } = string.Empty;
    public int MaxTokens { get; set; }
    public List<AnthropicMessage> Messages { get; set; } = [];
}

internal class AnthropicMessage
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

internal class AnthropicMessageResponse
{
    public List<AnthropicContentBlock>? Content { get; set; }
}

internal class AnthropicContentBlock
{
    public string Type { get; set; } = string.Empty;
    public string? Text { get; set; }
}
