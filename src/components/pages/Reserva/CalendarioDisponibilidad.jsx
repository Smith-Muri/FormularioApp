import { claveFecha } from "../../../utils/fecha";

const nombresDias = ["L", "M", "X", "J", "V", "S", "D"];

function reservasDelDia(reservas, fecha) {
    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);

    return reservas.filter((reserva) => {
        const inicio = new Date(reserva.fecha);
        const fin = new Date(inicio.getTime() + Number(reserva.tiempo) * 60_000);
        return inicio < finDia && fin > inicioDia;
    });
}

function horaLocal(fecha) {
    return new Date(fecha).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export function CalendarioDisponibilidad({ reservas, fechaSeleccionada, onSeleccionarFecha }) {
    const mesVisible = fechaSeleccionada
        ? new Date(`${fechaSeleccionada}T12:00:00`)
        : new Date();
    const primerDia = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const desplazamiento = (primerDia.getDay() + 6) % 7;
    const dias = Array.from({ length: 42 }, (_, indice) => {
        const fecha = new Date(primerDia);
        fecha.setDate(indice - desplazamiento + 1);
        return fecha.getMonth() === primerDia.getMonth() ? fecha : null;
    });
    const hoy = claveFecha(new Date());
    const nombreMes = primerDia.toLocaleDateString("es", { month: "long", year: "numeric" });
    const ocupadas = fechaSeleccionada ? reservasDelDia(reservas, fechaSeleccionada) : [];

    function cambiarMes(cantidad) {
        const fecha = new Date(primerDia.getFullYear(), primerDia.getMonth() + cantidad, 1);
        const primeraFecha = claveFecha(fecha);
        if (primeraFecha >= hoy || cantidad > 0) onSeleccionarFecha(primeraFecha);
    }

    return (
        <section className="availability-calendar" aria-label="Calendario de disponibilidad">
            <div className="calendar-heading">
                <button type="button" className="btn btn-outline-secondary" aria-label="Mes anterior" onClick={() => cambiarMes(-1)}>‹</button>
                <h2>{nombreMes}</h2>
                <button type="button" className="btn btn-outline-secondary" aria-label="Mes siguiente" onClick={() => cambiarMes(1)}>›</button>
            </div>
            <div className="calendar-grid" role="grid" aria-label={nombreMes}>
                {nombresDias.map((nombre, indice) => (
                    <span className="calendar-weekday" key={`${nombre}-${indice}`} role="columnheader">{nombre}</span>
                ))}
                {dias.map((dia, indice) => {
                    if (!dia) return <span className="calendar-empty" key={`empty-${indice}`} aria-hidden="true" />;
                    const fecha = claveFecha(dia);
                    const eventos = reservasDelDia(reservas, fecha);
                    const pasada = fecha < hoy;
                    return (
                        <button
                            type="button"
                            key={fecha}
                            role="gridcell"
                            className={`calendar-day${fecha === fechaSeleccionada ? " is-selected" : ""}${eventos.length ? " has-bookings" : ""}`}
                            aria-label={`${dia.getDate()} de ${nombreMes}${eventos.length ? `, ${eventos.length} reserva(s)` : ", disponible"}`}
                            aria-pressed={fecha === fechaSeleccionada}
                            disabled={pasada}
                            onClick={() => onSeleccionarFecha(fecha)}
                        >
                            <span>{dia.getDate()}</span>
                            {eventos.length > 0 && <i aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
            <div className="calendar-legend">
                <span><i className="calendar-legend-free" /> Sin reservas</span>
                <span><i className="calendar-legend-booked" /> Con reservas (revisa horarios)</span>
            </div>
            {fechaSeleccionada && (
                <div className="calendar-day-detail" aria-live="polite">
                    <h3>{new Date(`${fechaSeleccionada}T12:00:00`).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</h3>
                    {ocupadas.length === 0 ? (
                        <p className="mb-0">No hay reservas para este día. El horario está disponible.</p>
                    ) : (
                        <>
                            <p>Horarios ocupados para este espacio:</p>
                            <ul className="calendar-booking-list">
                                {ocupadas.map((reserva) => {
                                    const inicio = new Date(reserva.fecha);
                                    const fin = new Date(inicio.getTime() + Number(reserva.tiempo) * 60_000);
                                    return <li key={reserva.id}>{horaLocal(inicio)}–{horaLocal(fin)}</li>;
                                })}
                            </ul>
                            <small>Se permiten reservas en otros horarios que no se crucen.</small>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
