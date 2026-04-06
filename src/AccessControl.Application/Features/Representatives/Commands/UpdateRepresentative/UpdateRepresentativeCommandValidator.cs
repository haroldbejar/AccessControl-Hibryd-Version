using FluentValidation;

namespace AccessControl.Application.Features.Representatives.Commands.UpdateRepresentative;

public sealed class UpdateRepresentativeCommandValidator : AbstractValidator<UpdateRepresentativeCommand>
{
    public UpdateRepresentativeCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("El id del representante es requerido.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del representante es requerido.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.DestinationId)
            .GreaterThan(0).WithMessage("El destino es requerido.");

        RuleFor(x => x.Phone)
            .MaximumLength(15).WithMessage("El teléfono no puede superar 15 caracteres.")
            .When(x => x.Phone is not null);

        RuleFor(x => x.CellPhone)
            .MaximumLength(15).WithMessage("El celular no puede superar 15 caracteres.")
            .When(x => x.CellPhone is not null);

        RuleFor(x => x.Plate)
            .MaximumLength(20).WithMessage("La placa no puede superar 20 caracteres.")
            .When(x => x.Plate is not null);
    }
}
