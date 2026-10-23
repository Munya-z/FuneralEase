using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Obituaries;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text;

namespace FuneralEase.Application.Obituaries.Commands;

public enum TonePreference { Formal, Warm, Religious, Traditional }

public record ObituaryDto(
    Guid Id,
    Guid HouseholdId,
    string DeceasedFullName,
    string Content,
    bool IsAiGenerated,
    DateTimeOffset GeneratedAt,
    bool IsPublished);

public static class ObituaryMappings
{
    public static ObituaryDto ToDto(this Obituary o) => new(
        o.Id.Value,
        o.HouseholdId.Value,
        o.DeceasedFullName,
        o.Content,
        o.IsAiGenerated,
        o.GeneratedAt,
        o.IsPublished);
}

public record GenerateObituaryCommand(
    HouseholdId HouseholdId,
    string DeceasedFullName,
    int? AgeAtDeath,
    DateOnly? DateOfBirth,
    DateOnly? DateOfDeath,
    string? Occupation,
    string? Hometown,
    string? SurvivedBy,
    string? LifeHighlights,
    TonePreference TonePreference) : IRequest<ObituaryDto>;

public class GenerateObituaryCommandHandler(
    IApplicationDbContext db,
    IAnthropicClient anthropicClient,
    ILogger<GenerateObituaryCommandHandler> logger)
    : IRequestHandler<GenerateObituaryCommand, ObituaryDto>
{
    public async Task<ObituaryDto> Handle(GenerateObituaryCommand request, CancellationToken cancellationToken)
    {
        var (content, usedAi) = await GenerateContentAsync(request, cancellationToken);

        var existing = await db.Obituaries
            .FirstOrDefaultAsync(o => o.HouseholdId == request.HouseholdId, cancellationToken);

        Obituary obituary;
        if (existing is null)
        {
            obituary = Obituary.Create(request.HouseholdId, request.DeceasedFullName, content, isAiGenerated: usedAi);
            db.Obituaries.Add(obituary);
        }
        else
        {
            existing.UpdateContent(content, isAiGenerated: usedAi);
            obituary = existing;
        }

        await db.SaveChangesAsync(cancellationToken);
        return obituary.ToDto();
    }

    private async Task<(string Content, bool UsedAi)> GenerateContentAsync(
        GenerateObituaryCommand request,
        CancellationToken cancellationToken)
    {
        if (!anthropicClient.IsConfigured)
        {
            logger.LogInformation("Anthropic not configured — using template obituary for {Name}", request.DeceasedFullName);
            return (BuildTemplate(request), false);
        }

        try
        {
            var aiContent = await anthropicClient.GenerateObituaryAsync(BuildPrompt(request), cancellationToken);
            return (aiContent, true);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Anthropic generation failed — falling back to template for {Name}", request.DeceasedFullName);
            return (BuildTemplate(request), false);
        }
    }

    private static string BuildPrompt(GenerateObituaryCommand r)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Write an obituary for {r.DeceasedFullName}.");

        var tone = r.TonePreference switch
        {
            TonePreference.Formal => "formal and dignified",
            TonePreference.Warm => "warm, personal, and heartfelt",
            TonePreference.Religious => "religious and faith-centred, suitable for a Christian or faith-based service",
            TonePreference.Traditional => "traditional South African, respectful of cultural customs",
            _ => "warm and respectful"
        };
        sb.AppendLine($"The tone should be {tone}.");

        if (r.AgeAtDeath.HasValue)
            sb.AppendLine($"Age at death: {r.AgeAtDeath.Value}.");
        if (r.DateOfBirth.HasValue)
            sb.AppendLine($"Date of birth: {r.DateOfBirth.Value:d MMMM yyyy}.");
        if (r.DateOfDeath.HasValue)
            sb.AppendLine($"Date of death: {r.DateOfDeath.Value:d MMMM yyyy}.");
        if (!string.IsNullOrWhiteSpace(r.Occupation))
            sb.AppendLine($"Occupation: {r.Occupation}.");
        if (!string.IsNullOrWhiteSpace(r.Hometown))
            sb.AppendLine($"Hometown/city: {r.Hometown}.");
        if (!string.IsNullOrWhiteSpace(r.SurvivedBy))
            sb.AppendLine($"Survived by: {r.SurvivedBy}.");
        if (!string.IsNullOrWhiteSpace(r.LifeHighlights))
            sb.AppendLine($"Key life highlights and achievements: {r.LifeHighlights}.");

        sb.AppendLine();
        sb.AppendLine("Write the obituary in 3-5 paragraphs. Do not include a headline or title — start with the body text directly. Write in South African English.");

        return sb.ToString();
    }

    /// <summary>
    /// Offline / no-key fallback so generate never hard-fails in development.
    /// </summary>
    internal static string BuildTemplate(GenerateObituaryCommand r)
    {
        var ageBit = r.AgeAtDeath.HasValue ? $", aged {r.AgeAtDeath.Value}," : "";
        var birthBit = r.DateOfBirth.HasValue ? $" born on {r.DateOfBirth.Value:d MMMM yyyy}" : "";
        var deathBit = r.DateOfDeath.HasValue
            ? $" passed away on {r.DateOfDeath.Value:d MMMM yyyy}"
            : " has passed away";
        var placeBit = !string.IsNullOrWhiteSpace(r.Hometown) ? $" of {r.Hometown.Trim()}" : "";
        var workBit = !string.IsNullOrWhiteSpace(r.Occupation)
            ? $" {r.DeceasedFullName.Split(' ').FirstOrDefault() ?? r.DeceasedFullName} worked as a {r.Occupation.Trim()} and was known for quiet dedication and care for others."
            : $" Those who knew {r.DeceasedFullName} remember a life marked by kindness, dignity, and love for family.";

        var opening = r.TonePreference switch
        {
            TonePreference.Formal =>
                $"It is with deep respect that we announce the passing of {r.DeceasedFullName}{ageBit}{placeBit}.{birthBit}{deathBit}.",
            TonePreference.Religious =>
                $"In the loving care of the Lord, {r.DeceasedFullName}{ageBit}{placeBit}{deathBit}. We give thanks for a life lived in faith and love.{(string.IsNullOrWhiteSpace(birthBit) ? "" : $" Born{birthBit.TrimStart()}, their journey now rests in God's peace.")}",
            TonePreference.Traditional =>
                $"We mourn and honour {r.DeceasedFullName}{ageBit}{placeBit}, whose life strengthened family and community.{birthBit}{deathBit}. May their spirit be remembered with dignity.",
            _ =>
                $"With heavy hearts, we remember {r.DeceasedFullName}{ageBit}{placeBit}.{birthBit}{deathBit}. Their warmth and presence will be deeply missed."
        };

        var middle = workBit;
        if (!string.IsNullOrWhiteSpace(r.LifeHighlights))
            middle += $" Among the moments that defined this life: {r.LifeHighlights.Trim()}.";

        var closing = !string.IsNullOrWhiteSpace(r.SurvivedBy)
            ? $" {r.DeceasedFullName} is survived by {r.SurvivedBy.Trim()}. The family asks that you hold them in your thoughts as they celebrate a life well lived."
            : " The family asks that you hold them in your thoughts and honour a life well lived.";

        if (r.TonePreference == TonePreference.Religious)
            closing += " May their soul rest in eternal peace.";

        return $"{opening}\n\n{middle.Trim()}\n\n{closing.Trim()}";
    }
}
