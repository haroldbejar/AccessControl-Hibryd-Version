using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Roles.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Roles.Commands.CreateRole;

public sealed class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Result<RoleResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateRoleCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<RoleResponse>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = new Role
        {
            Name = request.Name.Trim(),
            Visible = true
        };

        await _uow.Roles.AddAsync(role, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result<RoleResponse>.Success(RoleMapper.ToResponse(role));
    }
}
