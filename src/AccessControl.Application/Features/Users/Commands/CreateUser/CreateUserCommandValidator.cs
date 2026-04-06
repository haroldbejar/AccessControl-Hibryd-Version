using FluentValidation;

namespace AccessControl.Application.Features.Users.Commands.CreateUser;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.UserAccount)
            .NotEmpty().WithMessage("El nombre de usuario es requerido.")
            .MaximumLength(50)
            .Matches(@"^[a-zA-Z0-9._-]+$")
            .WithMessage("El usuario solo puede contener letras, números, puntos, guiones y guiones bajos.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida.")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres.")
            .MaximumLength(100);

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(100);

        RuleFor(x => x.RoleId)
            .GreaterThan(0).WithMessage("El rol es requerido.");

        RuleFor(x => x.UserCreated)
            .GreaterThan(0).WithMessage("El usuario creador es requerido.");
    }
}
