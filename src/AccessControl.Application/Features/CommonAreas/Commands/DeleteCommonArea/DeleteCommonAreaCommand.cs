using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Commands.DeleteCommonArea;

public sealed record DeleteCommonAreaCommand(int Id) : IRequest<Result>;
