using FluentValidation;

namespace AccessControl.Application.Features.Destinations.Commands.CreateDestination;

public sealed class CreateDestinationCommandValidator : AbstractValidator<CreateDestinationCommand>
{
    public CreateDestinationCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del destino es requerido.")
            .MaximumLength(100).WithMessage("El nombre del destino no puede superar 100 caracteres.");
    }
}
