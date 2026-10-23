using FluentValidation;

namespace FuneralEase.Application.Policies.Commands.CreatePolicy;

public class CreatePolicyCommandValidator : AbstractValidator<CreatePolicyCommand>
{
    public CreatePolicyCommandValidator()
    {
        RuleFor(x => x.InsurerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PolicyNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PremiumAmount).GreaterThan(0);
        RuleFor(x => x.NextDueDate).Must(d => d >= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)))
            .WithMessage("NextDueDate cannot be in the past.");
    }
}
