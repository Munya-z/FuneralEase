using FluentValidation;

namespace FuneralEase.Application.Auth.Commands.VerifyOtp;

public class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
{
    public VerifyOtpCommandValidator()
    {
        RuleFor(x => x.MobileNumber)
            .NotEmpty()
            .Matches(@"^\+?[0-9]{9,15}$");

        RuleFor(x => x.Code)
            .NotEmpty()
            .Length(4, 8);

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200);

        // POPIA §18: explicit consent required when FullName is provided (new account signup)
        RuleFor(x => x.PopiaConsentGiven)
            .Must(consent => consent)
            .When(x => !string.IsNullOrWhiteSpace(x.FullName))
            .WithMessage("You must accept the privacy policy (POPIA) to create an account.");
    }
}
