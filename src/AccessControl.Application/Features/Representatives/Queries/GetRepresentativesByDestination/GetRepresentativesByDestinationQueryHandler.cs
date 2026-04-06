using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Queries.GetRepresentativesByDestination;

public sealed class GetRepresentativesByDestinationQueryHandler
    : IRequestHandler<GetRepresentativesByDestinationQuery, Result<IEnumerable<RepresentativeResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetRepresentativesByDestinationQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<RepresentativeResponse>>> Handle(
        GetRepresentativesByDestinationQuery request,
        CancellationToken cancellationToken)
    {
        var representatives = await _uow.Representatives.GetByDestinationIdAsync(request.DestinationId, cancellationToken);
        return Result<IEnumerable<RepresentativeResponse>>.Success(RepresentativeMapper.ToResponseList(representatives));
    }
}
