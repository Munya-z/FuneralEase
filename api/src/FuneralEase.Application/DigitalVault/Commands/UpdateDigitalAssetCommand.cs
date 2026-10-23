using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.DigitalVault;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.DigitalVault.Commands;

public record UpdateDigitalAssetCommand(
    DigitalAssetId AssetId,
    HouseholdId HouseholdId,
    DigitalAssetCategory Category,
    string ServiceName,
    string? Username,
    string? Notes,
    string? Url,
    OnDeathInstruction OnDeathInstruction) : IRequest<DigitalAssetDto>;

public class UpdateDigitalAssetCommandHandler(IApplicationDbContext db) : IRequestHandler<UpdateDigitalAssetCommand, DigitalAssetDto>
{
    public async Task<DigitalAssetDto> Handle(UpdateDigitalAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await db.DigitalAssets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId && a.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(DigitalAsset), request.AssetId);

        asset.Update(
            request.Category,
            request.ServiceName,
            request.Username,
            request.Notes,
            request.Url,
            request.OnDeathInstruction);

        await db.SaveChangesAsync(cancellationToken);
        return asset.ToDto();
    }
}
