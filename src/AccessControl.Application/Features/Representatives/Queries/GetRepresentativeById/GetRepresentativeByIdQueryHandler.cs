using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Queries.GetRepresentativeById;

public sealed class GetRepresentativeByIdQueryHandler : IRequestHandler<GetRepresentativeByIdQuery, Result<RepresentativeResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetRepresentativeByIdQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<RepresentativeResponse>> Handle(GetRepresentativeByIdQuery request, CancellationToken cancellationToken)
    {
        var representative = await _uow.Representatives.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Representative), request.Id);

        return Result<RepresentativeResponse>.Success(RepresentativeMapper.ToResponse(representative));
    }
}
