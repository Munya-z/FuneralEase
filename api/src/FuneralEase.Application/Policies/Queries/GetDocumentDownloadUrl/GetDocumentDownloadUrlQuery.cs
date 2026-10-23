using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Policies.Queries.GetDocumentDownloadUrl;

public record DocumentDownloadUrlDto(string DownloadUrl, DateTimeOffset ExpiresAt);

public record GetDocumentDownloadUrlQuery(PolicyId PolicyId, HouseholdId HouseholdId, string StorageKey)
    : IRequest<DocumentDownloadUrlDto>;

public class GetDocumentDownloadUrlQueryHandler(IApplicationDbContext db, IFileStorageService storage)
    : IRequestHandler<GetDocumentDownloadUrlQuery, DocumentDownloadUrlDto>
{
    public async Task<DocumentDownloadUrlDto> Handle(GetDocumentDownloadUrlQuery request, CancellationToken cancellationToken)
    {
        var policy = await db.Policies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Policies.Policy), request.PolicyId);

        var doc = policy.Documents.FirstOrDefault(d => d.StorageKey == request.StorageKey)
            ?? throw new NotFoundException("PolicyDocument", request.StorageKey);

        var url = await storage.GenerateDownloadUrlAsync(doc.StorageKey, cancellationToken);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(15);

        return new DocumentDownloadUrlDto(url, expiresAt);
    }
}
