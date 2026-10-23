using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.DigitalVault;
using MediatR;

namespace FuneralEase.Application.DigitalVault.Commands;

public record DigitalAssetDto(
    Guid Id,
    Guid HouseholdId,
    string Category,
    string ServiceName,
    string? Username,
    string? Notes,
    string? Url,
    string OnDeathInstruction,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public static class DigitalAssetMappings
{
    public static DigitalAssetDto ToDto(this DigitalAsset a) => new(
        a.Id.Value,
        a.HouseholdId.Value,
        a.Category.ToString(),
        a.ServiceName,
        a.Username,
        a.EncryptedNotes,
        a.Url,
        a.OnDeathInstruction.ToString(),
        a.CreatedAt,
        a.UpdatedAt);
}

public record CreateDigitalAssetCommand(
    HouseholdId HouseholdId,
    DigitalAssetCategory Category,
    string ServiceName,
    string? Username,
    string? Notes,
    string? Url,
    OnDeathInstruction OnDeathInstruction) : IRequest<DigitalAssetDto>;

public class CreateDigitalAssetCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateDigitalAssetCommand, DigitalAssetDto>
{
    public async Task<DigitalAssetDto> Handle(CreateDigitalAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = DigitalAsset.Create(
            request.HouseholdId,
            request.Category,
            request.ServiceName,
            request.Username,
            request.Notes,
            request.Url,
            request.OnDeathInstruction);

        db.DigitalAssets.Add(asset);
        await db.SaveChangesAsync(cancellationToken);
        return asset.ToDto();
    }
}
