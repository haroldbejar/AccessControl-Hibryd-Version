using AccessControl.Application.Features.Menus.Queries.GetAllMenus;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class MenusController : BaseController
{
    public MenusController(IMediator mediator) : base(mediator) { }
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllMenusQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}
