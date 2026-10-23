using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Commands.UploadPolicyDocument;

public class UploadPolicyDocumentCommandHandler(IApplicationDbContext db, IFileStorageService storage)
    : IRequestHandler<UploadPolicyDocumentCommand, PresignedUploadUrl>
{
    public async Task<PresignedUploadUrl> Handle(UploadPolicyDocumentCommand request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Policies.Policy), request.PolicyId);

        var presigned = await storage.GenerateUploadUrlAsync(request.FileName, request.ContentType, cancellationToken);

        policy.AddDocument(presigned.StorageKey, request.FileName, request.ContentType);
        await db.SaveChangesAsync(cancellationToken);

        return presigned;
    }
}
