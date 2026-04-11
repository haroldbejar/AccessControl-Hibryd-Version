namespace AccessControl.Domain.Enums
{
    /// <summary>
    /// Enumeración para los estados de las reservas de zonas comunes
    /// </summary>
    public enum ReservationStatusEnum
    {
        /// <summary> Reserva creada, pendiente de confirmación </summary>
        Pending = 1,

        /// <summary> Reserva confirmada por el administrador </summary>
        Confirmed = 2,

        /// <summary> Reserva cancelada </summary>
        Cancelled = 3,

        /// <summary> Reserva completada </summary>
        Completed = 4
    }
}
