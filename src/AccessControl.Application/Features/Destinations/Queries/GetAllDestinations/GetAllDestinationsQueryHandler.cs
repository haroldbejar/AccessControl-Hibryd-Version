using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Destinations.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Queries.GetAllDestinations;

public sealed class GetAllDestinationsQueryHandler : IRequestHandler<GetAllDestinationsQuery, Result<IEnumerable<DestinationResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllDestinationsQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<DestinationResponse>>> Handle(GetAllDestinationsQuery request, CancellationToken cancellationToken)
    {
        var destinations = await _uow.Destinations.GetAllAsync(cancellationToken);
        return Result<IEnumerable<DestinationResponse>>.Success(DestinationMapper.ToResponseList(destinations));
    }
}
