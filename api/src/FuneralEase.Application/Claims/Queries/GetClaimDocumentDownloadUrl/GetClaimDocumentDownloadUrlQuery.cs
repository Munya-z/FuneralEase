using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Claims.Queries.GetClaimDocumentDownloadUrl;

public record DocumentDownloadUrlDto(string DownloadUrl, DateTimeOffset ExpiresAt);

public record GetClaimDocumentDownloadUrlQuery(ClaimId ClaimId, HouseholdId HouseholdId, string StorageKey)
    : IRequest<DocumentDownloadUrlDto>;

public class GetClaimDocumentDownloadUrlQueryHandler(IApplicationDbContext db, IFileStorageService storage)
    : IRequestHandler<GetClaimDocumentDownloadUrlQuery, DocumentDownloadUrlDto>
{
    public async Task<DocumentDownloadUrlDto> Handle(GetClaimDocumentDownloadUrlQuery request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Claim), request.ClaimId);

        var doc = claim.Documents.FirstOrDefault(d => d.StorageKey == request.StorageKey)
            ?? throw new NotFoundException("ClaimDocument", request.StorageKey);

        var downloadUrl = await storage.GenerateDownloadUrlAsync(doc.StorageKey, cancellationToken);

        return new DocumentDownloadUrlDto(downloadUrl, DateTimeOffset.UtcNow.AddMinutes(15));
    }
}
