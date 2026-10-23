using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Commands.UploadClaimDocument;

public record UploadClaimDocumentCommand(ClaimId ClaimId, HouseholdId HouseholdId, string FileName, string ContentType)
    : IRequest<PresignedUploadUrl>;

public class UploadClaimDocumentCommandHandler(IApplicationDbContext db, IFileStorageService storage)
    : IRequestHandler<UploadClaimDocumentCommand, PresignedUploadUrl>
{
    public async Task<PresignedUploadUrl> Handle(UploadClaimDocumentCommand request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Claim), request.ClaimId);

        var presigned = await storage.GenerateUploadUrlAsync(request.FileName, request.ContentType, cancellationToken);

        claim.AddDocument(presigned.StorageKey, request.FileName, request.ContentType);
        await db.SaveChangesAsync(cancellationToken);

        return presigned;
    }
}
