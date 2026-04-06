using AccessControl.Application.Features.Visits.Commands.CheckOutVisit;
using AccessControl.Application.Features.Visits.Commands.CreateVisit;
using AccessControl.Application.Features.Visits.Commands.DeleteVisit;
using AccessControl.Application.Features.Visits.Queries.GetAllVisits;
using AccessControl.Application.Features.Visits.Queries.GetVisitByDocument;
using AccessControl.Application.Features.Visits.Queries.GetVisitById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class VisitsController : BaseController
{
    public VisitsController(IMediator mediator) : base(mediator) { }

    /// <summary>Obtiene todas las visitas con filtros opcionales</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string? documentFilter = null,
        [FromQuery] string? nameFilter = null,
        [FromQuery] int? destinationFilter = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetAllVisitsQuery(startDate, endDate, documentFilter, nameFilter, destinationFilter),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Obtiene una visita por su ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetVisitByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Obtiene la visita activa (sin checkout) de un visitante por documento</summary>
    [HttpGet("document/{documentNumber}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByDocument(string documentNumber, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetVisitByDocumentQuery(documentNumber), cancellationToken);
        return Ok(result);
    }

    /// <summary>Registra el ingreso de un visitante</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateVisitCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result);
    }

    /// <summary>Registra la salida (checkout) de un visitante por documento</summary>
    [HttpPatch("{documentNumber}/checkout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CheckOut(string documentNumber, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CheckOutVisitCommand(documentNumber, CurrentUserId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Elimina (soft-delete) una visita</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteVisitCommand(id, CurrentUserId), cancellationToken);
        return NoContent();
    }
}
