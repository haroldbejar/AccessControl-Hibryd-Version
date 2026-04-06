using AccessControl.Application.Features.Destinations.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class DestinationMapper
{
    public static partial DestinationResponse ToResponse(this Destination destination);

    public static partial IEnumerable<DestinationResponse> ToResponseList(this IEnumerable<Destination> destinations);
}
