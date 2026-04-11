using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Queries.GetCommonAreaById;

public sealed class GetCommonAreaByIdQueryHandler : IRequestHandler<GetCommonAreaByIdQuery, Result<CommonAreaResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetCommonAreaByIdQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<CommonAreaResponse>> Handle(GetCommonAreaByIdQuery request, CancellationToken cancellationToken)
    {
        var area = await _uow.CommonAreas.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(CommonArea), request.Id);

        return Result<CommonAreaResponse>.Success(area.ToResponse());
    }
}
