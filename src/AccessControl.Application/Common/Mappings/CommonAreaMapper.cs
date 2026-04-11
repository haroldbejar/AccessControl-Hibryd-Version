using AccessControl.Application.Features.CommonAreas.Dtos;
using AccessControl.Domain.Entities;

namespace AccessControl.Application.Common.Mappings;

public static class CommonAreaMapper
{
    public static CommonAreaResponse ToResponse(this CommonArea c) => new(
        Id: c.Id,
        Name: c.Name,
        Description: c.Description,
        Capacity: c.Capacity,
        Location: c.Location,
        OpeningTime: c.OpeningTime.ToString("HH:mm"),
        ClosingTime: c.ClosingTime.ToString("HH:mm"),
        Visible: !c.Eliminated
    );

    public static IEnumerable<CommonAreaResponse> ToResponseList(this IEnumerable<CommonArea> areas)
        => areas.Select(a => a.ToResponse());
}
