using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Policies;

public class PolicyBeneficiary : Entity<PolicyBeneficiaryId>
{
    public PolicyId PolicyId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string Relationship { get; private set; } = string.Empty;
    public decimal BenefitPercentage { get; private set; }

    private PolicyBeneficiary() { }

    public PolicyBeneficiary(PolicyId policyId, string fullName, string relationship, decimal benefitPercentage)
        : base(PolicyBeneficiaryId.New())
    {
        PolicyId = policyId;
        FullName = Guard.NotNullOrEmpty(fullName, nameof(fullName));
        Relationship = Guard.NotNullOrEmpty(relationship, nameof(relationship));
        if (benefitPercentage is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(benefitPercentage), "Must be between 0 and 100.");
        BenefitPercentage = benefitPercentage;
    }
}
