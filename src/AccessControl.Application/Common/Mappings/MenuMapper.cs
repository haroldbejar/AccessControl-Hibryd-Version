using AccessControl.Application.Features.Menus.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class MenuMapper
{
    public static partial MenuResponse ToResponse(this Menu menu);

    public static partial IEnumerable<MenuResponse> ToResponseList(this IEnumerable<Menu> menus);
}
