using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Destinations.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Commands.CreateDestination;

public sealed class CreateDestinationCommandHandler : IRequestHandler<CreateDestinationCommand, Result<DestinationResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateDestinationCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<DestinationResponse>> Handle(CreateDestinationCommand request, CancellationToken cancellationToken)
    {
        var destination = new Destination
        {
            Name = request.Name.Trim()
        };

        await _uow.Destinations.AddAsync(destination, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result<DestinationResponse>.Success(DestinationMapper.ToResponse(destination));
    }
}
