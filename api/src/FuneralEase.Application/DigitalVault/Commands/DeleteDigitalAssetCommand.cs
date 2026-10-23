using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.DigitalVault;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.DigitalVault.Commands;

public record DeleteDigitalAssetCommand(DigitalAssetId AssetId, HouseholdId HouseholdId) : IRequest;

public class DeleteDigitalAssetCommandHandler(IApplicationDbContext db) : IRequestHandler<DeleteDigitalAssetCommand>
{
    public async Task Handle(DeleteDigitalAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await db.DigitalAssets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId && a.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(DigitalAsset), request.AssetId);

        db.DigitalAssets.Remove(asset);
        await db.SaveChangesAsync(cancellationToken);
    }
}
