using AccessControl.Application.Features.Reports.Queries.GetActivitySummary;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class ReportsController : BaseController
{
    public ReportsController(IMediator mediator) : base(mediator) { }

    /// <summary>
    /// Devuelve un resumen ejecutivo de actividad para el período indicado.
    /// Solo accesible por administradores (validación de rol en frontend).
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetActivitySummaryQuery(startDate, endDate), cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}
