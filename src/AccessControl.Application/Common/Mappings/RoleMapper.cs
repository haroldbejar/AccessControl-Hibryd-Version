using AccessControl.Application.Features.Roles.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class RoleMapper
{
    public static partial RoleResponse ToResponse(this Role role);

    public static partial IEnumerable<RoleResponse> ToResponseList(this IEnumerable<Role> roles);
}
