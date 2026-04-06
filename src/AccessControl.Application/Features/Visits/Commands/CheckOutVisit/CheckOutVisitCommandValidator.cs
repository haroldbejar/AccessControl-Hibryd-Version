using FluentValidation;

namespace AccessControl.Application.Features.Visits.Commands.CheckOutVisit;

public sealed class CheckOutVisitCommandValidator : AbstractValidator<CheckOutVisitCommand>
{
    public CheckOutVisitCommandValidator()
    {
        RuleFor(x => x.DocumentNumber)
            .NotEmpty().WithMessage("El número de documento es requerido.");

        RuleFor(x => x.UserModified)
            .GreaterThan(0).WithMessage("El usuario modificador es requerido.");
    }
}
