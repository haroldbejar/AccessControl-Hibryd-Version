using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Destinations.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Queries.GetDestinationById;

public sealed class GetDestinationByIdQueryHandler : IRequestHandler<GetDestinationByIdQuery, Result<DestinationResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetDestinationByIdQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<DestinationResponse>> Handle(GetDestinationByIdQuery request, CancellationToken cancellationToken)
    {
        var destination = await _uow.Destinations.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Destination), request.Id);

        return Result<DestinationResponse>.Success(DestinationMapper.ToResponse(destination));
    }
}
