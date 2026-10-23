using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;

namespace FuneralEase.Application.Common.Interfaces;

public interface ICurrentUserService
{
    UserId UserId { get; }
    HouseholdId HouseholdId { get; }
    MemberRole Role { get; }
    bool IsAdmin { get; }
    bool IsAuthenticated { get; }
}
