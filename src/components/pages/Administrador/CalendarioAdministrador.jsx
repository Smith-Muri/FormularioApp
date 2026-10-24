import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { listarEspacios } from "../../../services/servicioEspacios";
import { listarReservas } from "../../../services/servicioReservas";
import { CalendarioDisponibilidad } from "../Reserva/CalendarioDisponibilidad";
import { claveFecha } from "../../../utils/fecha";

export function CalendarioAdministrador() {
    const [espacios, setEspacios] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [espacioId, setEspacioId] = useState("");
    const [fecha, setFecha] = useState(claveFecha(new Date()));
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;
        Promise.all([listarEspacios(), listarReservas()])
            .then(([listaEspacios, listaReservas]) => {
                if (!activo) return;
                setEspacios(listaEspacios);
                setReservas(listaReservas);
                setEspacioId(listaEspacios[0]?.id || "");
            })
            .catch((fallo) => {
                if (!activo) return;
                const detalle = axios.isAxiosError(fallo) ? fallo.response?.data?.detail : "";
                setError(detalle || "No se pudo cargar el calendario de reservas.");
            })
            .finally(() => {
                if (activo) setCargando(false);
            });
        return () => { activo = false; };
    }, []);

    const reservasEspacio = useMemo(
        () => reservas.filter((reserva) => reserva.espacioId === espacioId),
        [reservas, espacioId],
    );

    return (
        <main className="form-page">
            <section className="container py-5">
                <Link to="/administrador" className="back-link">← Panel administrador</Link>
                <p className="eyebrow form-eyebrow">Agenda del catálogo</p>
                <h1>Calendario de reservas</h1>
                <p className="form-intro">Selecciona un espacio para consultar sus fechas y horarios ocupados.</p>
                {cargando ? (
                    <p role="status">Cargando reservas…</p>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">{error}</div>
                ) : espacios.length === 0 ? (
                    <div className="alert alert-info" role="status">Crea un espacio para comenzar a recibir reservas.</div>
                ) : (
                    <div className="admin-calendar-layout">
                        <section className="form-panel">
                            <div className="form-field">
                                <label htmlFor="admin-espacio">Espacio</label>
                                <select id="admin-espacio" className="form-select" value={espacioId} onChange={(evento) => setEspacioId(evento.target.value)}>
                                    {espacios.map((espacio) => <option key={espacio.id} value={espacio.id}>{espacio.nombre}</option>)}
                                </select>
                            </div>
                            <CalendarioDisponibilidad reservas={reservasEspacio} fechaSeleccionada={fecha} onSeleccionarFecha={setFecha} />
                        </section>
                        <section className="form-panel">
                            <h2>Reservas de {espacios.find((espacio) => espacio.id === espacioId)?.nombre}</h2>
                            {reservasEspacio.length === 0 ? (
                                <p className="text-secondary">Este espacio aún no tiene reservas.</p>
                            ) : (
                                <ul className="admin-booking-list">
                                    {reservasEspacio.map((reserva) => (
                                        <li key={reserva.id}>
                                            <strong>{new Date(reserva.fecha).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })}</strong>
                                            <span>{reserva.tiempo} minutos</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                )}
            </section>
        </main>
    );
}
