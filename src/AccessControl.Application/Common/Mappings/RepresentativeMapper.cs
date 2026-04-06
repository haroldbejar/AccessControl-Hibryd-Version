using AccessControl.Application.Features.Representatives.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class RepresentativeMapper
{
    [MapProperty("Destination.Name", "DestinationName")]
    public static partial RepresentativeResponse ToResponse(this Representative representative);

    public static partial IEnumerable<RepresentativeResponse> ToResponseList(this IEnumerable<Representative> representatives);
}
