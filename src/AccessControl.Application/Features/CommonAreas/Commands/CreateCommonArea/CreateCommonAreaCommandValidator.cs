using FluentValidation;

namespace AccessControl.Application.Features.CommonAreas.Commands.CreateCommonArea;

public sealed class CreateCommonAreaCommandValidator : AbstractValidator<CreateCommonAreaCommand>
{
    public CreateCommonAreaCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre de la zona común es requerido.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => x.Description is not null)
            .WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.Location)
            .MaximumLength(200).When(x => x.Location is not null)
            .WithMessage("La ubicación no puede superar 200 caracteres.");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).When(x => x.Capacity.HasValue)
            .WithMessage("La capacidad debe ser mayor a 0.");

        RuleFor(x => x)
            .Must(x => x.OpeningTime < x.ClosingTime)
            .WithMessage("La hora de apertura debe ser anterior a la hora de cierre.");

        RuleFor(x => x.UserCreated)
            .GreaterThan(0).WithMessage("El usuario creador es requerido.");
    }
}
