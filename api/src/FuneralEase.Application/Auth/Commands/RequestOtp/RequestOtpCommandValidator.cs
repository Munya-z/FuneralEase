using FluentValidation;

namespace FuneralEase.Application.Auth.Commands.RequestOtp;

public class RequestOtpCommandValidator : AbstractValidator<RequestOtpCommand>
{
    public RequestOtpCommandValidator()
    {
        RuleFor(x => x.MobileNumber)
            .NotEmpty()
            .Matches(@"^\+?[0-9]{9,15}$")
            .WithMessage("Mobile number must be a valid phone number.");
    }
}
