using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Commands.CreateCommonArea;

public sealed class CreateCommonAreaCommandHandler : IRequestHandler<CreateCommonAreaCommand, Result<CommonAreaResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateCommonAreaCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<CommonAreaResponse>> Handle(CreateCommonAreaCommand request, CancellationToken cancellationToken)
    {
        var exists = await _uow.CommonAreas.FindAsync(
            c => c.Name.ToLower() == request.Name.Trim().ToLower(),
            cancellationToken);

        if (exists.Any())
            return Result<CommonAreaResponse>.Failure($"Ya existe una zona común con el nombre '{request.Name}'.");

        var area = new CommonArea
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Capacity = request.Capacity,
            Location = request.Location?.Trim(),
            OpeningTime = request.OpeningTime,
            ClosingTime = request.ClosingTime,
            UserCreated = request.UserCreated
        };

        await _uow.CommonAreas.AddAsync(area, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result<CommonAreaResponse>.Success(area.ToResponse());
    }
}
