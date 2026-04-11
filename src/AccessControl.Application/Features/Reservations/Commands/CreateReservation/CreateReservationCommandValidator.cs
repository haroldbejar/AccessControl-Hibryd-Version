using FluentValidation;

namespace AccessControl.Application.Features.Reservations.Commands.CreateReservation;

public sealed class CreateReservationCommandValidator : AbstractValidator<CreateReservationCommand>
{
    public CreateReservationCommandValidator()
    {
        RuleFor(x => x.CommonAreaId)
            .GreaterThan(0).WithMessage("El identificador de la zona común es requerido.");

        RuleFor(x => x.DestinationId)
            .GreaterThan(0).WithMessage("El identificador del destinatario es requerido.");

        RuleFor(x => x.RepresentativeId)
            .GreaterThan(0).WithMessage("El identificador del representante es requerido.");

        RuleFor(x => x.ReservationDate)
            .Must(d => d >= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de reserva no puede ser en el pasado.");

        RuleFor(x => x.StartTime)
            .LessThan(x => x.EndTime)
            .WithMessage("La hora de inicio debe ser anterior a la hora de fin.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Las notas no pueden superar los 500 caracteres.")
            .When(x => x.Notes is not null);

        RuleFor(x => x.UserCreated)
            .GreaterThan(0).WithMessage("El usuario creador es requerido.");
    }
}
