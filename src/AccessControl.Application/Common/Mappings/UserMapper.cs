using AccessControl.Application.Features.Users.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class UserMapper
{
    [MapProperty("Role.Name", "RoleName")]
    public static partial UserResponse ToResponse(this User user);

    public static partial IEnumerable<UserResponse> ToResponseList(this IEnumerable<User> users);
}
