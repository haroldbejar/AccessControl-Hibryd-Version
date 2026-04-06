using AccessControl.Application.Features.Authorizations.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class AuthorizationMapper
{
    [MapProperty("Role.Name", "RoleName")]
    [MapProperty("Menu.Name", "MenuName")]
    public static partial AuthorizationResponse ToResponse(this Authorization authorization);

    public static partial IEnumerable<AuthorizationResponse> ToResponseList(this IEnumerable<Authorization> authorizations);
}
