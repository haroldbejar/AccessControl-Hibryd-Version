using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Authorizations.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Authorizations.Queries.GetAuthorizationsByRole;

public sealed class GetAuthorizationsByRoleQueryHandler
    : IRequestHandler<GetAuthorizationsByRoleQuery, Result<IEnumerable<AuthorizationResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetAuthorizationsByRoleQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<AuthorizationResponse>>> Handle(
        GetAuthorizationsByRoleQuery request,
        CancellationToken cancellationToken)
    {
        var authorizations = await _uow.Authorizations.FindAsync(
            a => a.RoleId == request.RoleId,
            cancellationToken);

        return Result<IEnumerable<AuthorizationResponse>>.Success(
            AuthorizationMapper.ToResponseList(authorizations));
    }
}
