using FluentValidation;

namespace AccessControl.Application.Features.Authorizations.Commands.UpsertAuthorization;

public sealed class UpsertAuthorizationCommandValidator : AbstractValidator<UpsertAuthorizationCommand>
{
    public UpsertAuthorizationCommandValidator()
    {
        RuleFor(x => x.RoleId)
            .GreaterThan(0).WithMessage("El rol es requerido.");

        RuleFor(x => x.MenuId)
            .GreaterThan(0).WithMessage("El menú es requerido.");
    }
}
