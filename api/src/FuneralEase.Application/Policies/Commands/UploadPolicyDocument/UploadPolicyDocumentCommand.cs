using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Policies.Commands.UploadPolicyDocument;

public record UploadPolicyDocumentCommand(PolicyId PolicyId, HouseholdId HouseholdId, string FileName, string ContentType) : IRequest<PresignedUploadUrl>;
