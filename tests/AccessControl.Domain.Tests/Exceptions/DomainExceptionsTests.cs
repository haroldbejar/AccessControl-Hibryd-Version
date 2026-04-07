using AccessControl.Domain.Exceptions;
using FluentAssertions;

namespace AccessControl.Domain.Test.Exceptions;

public class DomainExceptionsTests
{
    // ─── DomainException ───────────────────────────────────────────────────────

    [Fact]
    public void DomainException_WithMessage_ShouldSetMessage()
    {
        const string message = "Error de dominio";

        var ex = new DomainException(message);

        ex.Message.Should().Be(message);
    }

    [Fact]
    public void DomainException_WithMessageAndInnerException_ShouldSetBoth()
    {
        const string message = "Error con causa";
        var inner = new Exception("Causa original");

        var ex = new DomainException(message, inner);

        ex.Message.Should().Be(message);
        ex.InnerException.Should().Be(inner);
    }

    [Fact]
    public void DomainException_Parameterless_ShouldBeInstantiable()
    {
        Action act = () => throw new DomainException();

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void DomainException_ShouldBeTypeOfException()
    {
        var ex = new DomainException("test");

        ex.Should().BeAssignableTo<Exception>();
    }

    // ─── EntityNotFoundException ───────────────────────────────────────────────

    [Fact]
    public void EntityNotFoundException_ShouldFormatMessageCorrectly()
    {
        var ex = new EntityNotFoundException("Visit", 42);

        ex.Message.Should().Be("Entity \"Visit\" (42) was not found.");
    }

    [Fact]
    public void EntityNotFoundException_ShouldInheritFromDomainException()
    {
        var ex = new EntityNotFoundException("Package", 1);

        ex.Should().BeAssignableTo<DomainException>();
    }

    [Fact]
    public void EntityNotFoundException_WithStringKey_ShouldFormatMessageCorrectly()
    {
        var ex = new EntityNotFoundException("User", "admin");

        ex.Message.Should().Be("Entity \"User\" (admin) was not found.");
    }

    // ─── InvalidOperationDomainException ──────────────────────────────────────

    [Fact]
    public void InvalidOperationDomainException_ShouldSetMessage()
    {
        const string message = "Operación no permitida en este estado";

        var ex = new InvalidOperationDomainException(message);

        ex.Message.Should().Be(message);
    }

    [Fact]
    public void InvalidOperationDomainException_ShouldInheritFromDomainException()
    {
        var ex = new InvalidOperationDomainException("test");

        ex.Should().BeAssignableTo<DomainException>();
    }

    [Fact]
    public void InvalidOperationDomainException_ShouldBeThrownAndCaught()
    {
        Action act = () => throw new InvalidOperationDomainException("Estado inválido");

        act.Should().Throw<InvalidOperationDomainException>()
            .WithMessage("Estado inválido");
    }
}
