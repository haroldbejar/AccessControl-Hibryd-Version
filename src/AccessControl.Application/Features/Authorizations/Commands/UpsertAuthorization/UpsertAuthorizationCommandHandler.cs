using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Authorizations.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Authorizations.Commands.UpsertAuthorization;

public sealed class UpsertAuthorizationCommandHandler : IRequestHandler<UpsertAuthorizationCommand, Result<AuthorizationResponse>>
{
    private readonly IUnitOfWork _uow;

    public UpsertAuthorizationCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<AuthorizationResponse>> Handle(UpsertAuthorizationCommand request, CancellationToken cancellationToken)
    {
        // Verificar que el rol y menú existen
        var role = await _uow.Roles.GetByIdAsync(request.RoleId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Role), request.RoleId);

        var menu = await _uow.Menus.GetByIdAsync(request.MenuId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Menu), request.MenuId);

        // Buscar si ya existe la autorización para este par (RoleId, MenuId)
        var existing = (await _uow.Authorizations.FindAsync(
            a => a.RoleId == request.RoleId && a.MenuId == request.MenuId,
            cancellationToken)).FirstOrDefault();

        AuthorizationResponse response;

        if (existing is null)
        {
            var authorization = new Authorization
            {
                RoleId = request.RoleId,
                MenuId = request.MenuId,
                Role = role,
                Menu = menu,
                Create = request.Create,
                Read = request.Read,
                Update = request.Update,
                Delete = request.Delete
            };

            await _uow.Authorizations.AddAsync(authorization, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);

            response = AuthorizationMapper.ToResponse(authorization);
        }
        else
        {
            existing.Create = request.Create;
            existing.Read = request.Read;
            existing.Update = request.Update;
            existing.Delete = request.Delete;
            existing.Role = role;
            existing.Menu = menu;

            await _uow.Authorizations.UpdateAsync(existing, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);

            response = AuthorizationMapper.ToResponse(existing);
        }

        return Result<AuthorizationResponse>.Success(response);
    }
}
