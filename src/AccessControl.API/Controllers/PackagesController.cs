using AccessControl.Application.Features.Packages.Commands.CreatePackage;
using AccessControl.Application.Features.Packages.Commands.DeletePackage;
using AccessControl.Application.Features.Packages.Commands.DeliverPackage;
using AccessControl.Application.Features.Packages.Queries.GetAllPackages;
using AccessControl.Application.Features.Packages.Queries.GetPackageById;
using AccessControl.Application.Features.Packages.Queries.GetPendingPackages;
using AccessControl.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class PackagesController : BaseController
{
    public PackagesController(IMediator mediator) : base(mediator) { }

    /// <summary>Obtiene todos los paquetes con filtros opcionales</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string? controlNumber = null,
        [FromQuery] string? senderName = null,
        [FromQuery] int? destinationId = null,
        [FromQuery] PackagesStatusEnum? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetAllPackagesQuery(startDate, endDate, controlNumber, senderName, destinationId, status),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Obtiene los paquetes pendientes de entrega</summary>
    [HttpGet("pending")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPending(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPendingPackagesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Obtiene un paquete por su ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPackageByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Registra la recepción de un paquete</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePackageCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result);
    }

    /// <summary>Registra la entrega de un paquete al destinatario</summary>
    [HttpPatch("{id:int}/deliver")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deliver(int id, [FromBody] DeliverPackageCommand command, CancellationToken cancellationToken)
    {
        if (id != command.PackageId)
            return BadRequest("El ID de la ruta no coincide con el ID del body.");

        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Elimina (soft-delete) un paquete</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeletePackageCommand(id, 1), cancellationToken);
        return NoContent();
    }
}
