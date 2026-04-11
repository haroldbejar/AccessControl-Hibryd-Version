using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Queries.GetAllCommonAreas;

public sealed class GetAllCommonAreasQueryHandler : IRequestHandler<GetAllCommonAreasQuery, Result<IEnumerable<CommonAreaResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllCommonAreasQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<CommonAreaResponse>>> Handle(GetAllCommonAreasQuery request, CancellationToken cancellationToken)
    {
        var areas = await _uow.CommonAreas.GetAllAsync(cancellationToken);
        return Result<IEnumerable<CommonAreaResponse>>.Success(areas.ToResponseList());
    }
}
