using FluentValidation;

namespace AccessControl.Application.Features.Visits.Commands.CreateVisit;

public sealed class CreateVisitCommandValidator : AbstractValidator<CreateVisitCommand>
{
    public CreateVisitCommandValidator()
    {
        RuleFor(x => x.DocumentNumber)
            .NotEmpty().WithMessage("El número de documento es requerido.")
            .MaximumLength(20);

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("El primer nombre es requerido.")
            .MaximumLength(50);

        RuleFor(x => x.SecondName)
            .MaximumLength(50).When(x => x.SecondName is not null);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("El apellido es requerido.")
            .MaximumLength(50);

        RuleFor(x => x.SecondLastName)
            .MaximumLength(50).When(x => x.SecondLastName is not null);

        RuleFor(x => x.RepresentativeId)
            .GreaterThan(0).WithMessage("El representante es requerido.");

        RuleFor(x => x.UserCreated)
            .GreaterThan(0).WithMessage("El usuario creador es requerido.");

        // Si tiene vehículo, la placa es obligatoria
        RuleFor(x => x.Plate)
            .NotEmpty().WithMessage("La placa del vehículo es requerida.")
            .MaximumLength(20)
            .When(x => x.HasVehicle);
    }
}
