using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class VisitMapper
{
    [MapProperty("Representative.Name", "RepresentativeName")]
    [MapProperty("Representative.DestinationId", "DestinationId")]
    [MapProperty("Representative.Destination.Name", "DestinationName")]
    public static partial VisitResponse ToResponse(this Visit visit);

    public static partial IEnumerable<VisitResponse> ToResponseList(this IEnumerable<Visit> visits);
}
