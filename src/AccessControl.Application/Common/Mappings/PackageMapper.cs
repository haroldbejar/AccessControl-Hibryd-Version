using AccessControl.Application.Features.Packages.Dtos;
using AccessControl.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace AccessControl.Application.Common.Mappings;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class PackageMapper
{
    [MapProperty("Destination.Name", "DestinationName")]
    [MapProperty("Representative.Name", "RepresentativeName")]
    public static partial PackageResponse ToResponse(this Package package);

    public static partial IEnumerable<PackageResponse> ToResponseList(this IEnumerable<Package> packages);
}
