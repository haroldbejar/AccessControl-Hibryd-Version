using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Commands.UpdateCommonArea;

public sealed class UpdateCommonAreaCommandHandler : IRequestHandler<UpdateCommonAreaCommand, Result<CommonAreaResponse>>
{
    private readonly IUnitOfWork _uow;

    public UpdateCommonAreaCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<CommonAreaResponse>> Handle(UpdateCommonAreaCommand request, CancellationToken cancellationToken)
    {
        var area = await _uow.CommonAreas.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(CommonArea), request.Id);

        var duplicate = await _uow.CommonAreas.FindAsync(
            c => c.Name.ToLower() == request.Name.Trim().ToLower() && c.Id != request.Id,
            cancellationToken);

        if (duplicate.Any())
            return Result<CommonAreaResponse>.Failure($"Ya existe otra zona común con el nombre '{request.Name}'.");

        area.Name = request.Name.Trim();
        area.Description = request.Description?.Trim();
        area.Capacity = request.Capacity;
        area.Location = request.Location?.Trim();
        area.OpeningTime = request.OpeningTime;
        area.ClosingTime = request.ClosingTime;
        area.Eliminated = !request.Visible;
        area.UserModified = request.UserModified;

        await _uow.CommonAreas.UpdateAsync(area, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result<CommonAreaResponse>.Success(area.ToResponse());
    }
}
