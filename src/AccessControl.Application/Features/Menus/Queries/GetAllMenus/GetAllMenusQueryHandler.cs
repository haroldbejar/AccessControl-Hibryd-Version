using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Menus.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Menus.Queries.GetAllMenus;

public sealed class GetAllMenusQueryHandler : IRequestHandler<GetAllMenusQuery, Result<IEnumerable<MenuResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllMenusQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<MenuResponse>>> Handle(GetAllMenusQuery request, CancellationToken cancellationToken)
    {
        var menus = await _uow.Menus.GetAllAsync(cancellationToken);
        return Result<IEnumerable<MenuResponse>>.Success(MenuMapper.ToResponseList(menus));
    }
}
