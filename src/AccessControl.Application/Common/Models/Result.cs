namespace AccessControl.Application.Common.Models;

/// <summary>
/// Resultado de una operación que no retorna valor.
/// Evita lanzar excepciones para flujos de negocio esperados.
/// </summary>
public sealed class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }

    private Result(bool isSuccess, string? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

/// <summary>
/// Resultado de una operación que retorna un valor de tipo <typeparamref name="T"/>.
/// </summary>
public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T? Value { get; }
    public string? Error { get; }

    private Result(bool isSuccess, T? value, string? error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);

    /// <summary>Conversión implícita desde el valor de éxito.</summary>
    public static implicit operator Result<T>(T value) => Success(value);
}
