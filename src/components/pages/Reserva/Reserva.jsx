import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import { destinoPorRol } from "../../auth/authRoutes";
import { listarEspacios } from "../../../services/servicioEspacios";
import { guardarReserva, listarReservas } from "../../../services/servicioReservas";
import { CalendarioDisponibilidad } from "./CalendarioDisponibilidad";
import { claveFecha } from "../../../utils/fecha";

function mensajeError(error) {
    if (!axios.isAxiosError(error) || !error.response) {
        return "No se pudo conectar con el servidor. Verifica que Java esté activo.";
    }
    if (error.response.status === 409) {
        return "Ese horario acaba de ser reservado para este espacio. Elige otro horario.";
    }
    return error.response.data?.detail || `No se pudo guardar la reserva (HTTP ${error.response.status}).`;
}

function seCruzanReservas(reservas, inicio, duracion) {
    const fin = inicio.getTime() + duracion * 60_000;
    return reservas.some((reserva) => {
        const existente = new Date(reserva.fecha).getTime();
        const finExistente = existente + Number(reserva.tiempo) * 60_000;
        return inicio.getTime() < finExistente && existente < fin;
    });
}

export function Reserva() {
    const { usuario } = useAuth();
    const [parametros, setParametros] = useSearchParams();
    const [espacios, setEspacios] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [espacioId, setEspacioId] = useState(parametros.get("espacioId") || "");
    const [fecha, setFecha] = useState(claveFecha(new Date()));
    const [hora, setHora] = useState("");
    const [tiempo, setTiempo] = useState("");
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");
    const [errorServidor, setErrorServidor] = useState("");
    const [errores, setErrores] = useState({});
    const [guardado, setGuardado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        let activo = true;
        Promise.all([listarEspacios(), listarReservas()])
            .then(([listaEspacios, listaReservas]) => {
                if (!activo) return;
                setEspacios(listaEspacios);
                setReservas(listaReservas);
                const espacioInicial = parametros.get("espacioId");
                setEspacioId((actual) => listaEspacios.some((espacio) => espacio.id === actual)
                    ? actual
                    : listaEspacios.some((espacio) => espacio.id === espacioInicial)
                        ? espacioInicial
                        : listaEspacios[0]?.id || "");
            })
            .catch((error) => {
                if (activo) setErrorCarga(mensajeError(error));
            })
            .finally(() => {
                if (activo) setCargando(false);
            });
        return () => { activo = false; };
    }, [parametros]);

    const espacioSeleccionado = espacios.find((espacio) => espacio.id === espacioId);
    const reservasEspacio = useMemo(
        () => reservas.filter((reserva) => reserva.espacioId === espacioId),
        [reservas, espacioId],
    );

    function cambiarEspacio(evento) {
        const id = evento.target.value;
        setEspacioId(id);
        setParametros(id ? { espacioId: id } : {});
        setGuardado(false);
        setErrorServidor("");
    }

    async function manejarEnvio(evento) {
        evento.preventDefault();
        const erroresFormulario = {
            espacioId: espacioId ? "" : "Selecciona un espacio.",
            fecha: fecha ? "" : "Selecciona un día en el calendario.",
            hora: hora ? "" : "Selecciona una hora.",
            tiempo: Number.isInteger(Number(tiempo)) && Number(tiempo) > 0 && Number(tiempo) <= 1440
                ? ""
                : "La duración debe ser de 1 a 1440 minutos.",
        };

        const inicio = fecha && hora ? new Date(`${fecha}T${hora}:00`) : null;
        if (inicio && inicio <= new Date()) erroresFormulario.hora = "El horario debe ser futuro.";
        if (inicio && !erroresFormulario.tiempo && seCruzanReservas(reservasEspacio, inicio, Number(tiempo))) {
            erroresFormulario.hora = "El horario se cruza con otra reserva de este espacio.";
        }
        setErrores(erroresFormulario);
        if (Object.values(erroresFormulario).some(Boolean)) return;

        setGuardando(true);
        setErrorServidor("");
        setGuardado(false);
        try {
            const creada = await guardarReserva({
                espacioId,
                fecha: `${fecha}T${hora}:00`,
                tiempo: String(tiempo),
            });
            setReservas((anteriores) => [...anteriores, creada]);
            setGuardado(true);
            setHora("");
            setTiempo("");
        } catch (error) {
            setErrorServidor(mensajeError(error));
        } finally {
            setGuardando(false);
        }
    }

    if (cargando) return <main className="container py-5" role="status">Cargando disponibilidad…</main>;

    return (
        <main className="form-page">
            <section className="container py-5">
                <Link to={destinoPorRol(usuario?.rol)} className="back-link">← Volver al panel</Link>
                <p className="eyebrow form-eyebrow">Disponibilidad y agenda</p>
                <h1>Reservar un espacio</h1>
                <p className="form-intro">Elige un espacio y consulta sus reservas antes de seleccionar el horario.</p>

                {errorCarga ? (
                    <div className="alert alert-danger" role="alert">{errorCarga}</div>
                ) : espacios.length === 0 ? (
                    <div className="alert alert-info" role="status">Todavía no hay espacios para reservar. Vuelve más tarde.</div>
                ) : (
                    <div className="reservation-layout">
                        <section className="reservation-selection">
                            <div className="form-field">
                                <label htmlFor="espacioId">Espacio</label>
                                <select id="espacioId" className={`form-select ${errores.espacioId ? "is-invalid" : ""}`} value={espacioId} onChange={cambiarEspacio} required>
                                    {espacios.map((espacio) => <option value={espacio.id} key={espacio.id}>{espacio.nombre} · aforo {espacio.aforo}</option>)}
                                </select>
                                {errores.espacioId && <div className="invalid-feedback">{errores.espacioId}</div>}
                            </div>
                            {espacioSeleccionado?.foto && (
                                <img className="reservation-space-photo" src={espacioSeleccionado.foto} alt={`Fotografía de ${espacioSeleccionado.nombre}`} />
                            )}
                            {espacioSeleccionado && <p className="text-secondary">{espacioSeleccionado.descripcion}</p>}
                            <CalendarioDisponibilidad
                                reservas={reservasEspacio}
                                fechaSeleccionada={fecha}
                                onSeleccionarFecha={(dia) => {
                                    setFecha(dia);
                                    setErrores((actuales) => ({ ...actuales, fecha: "", hora: "" }));
                                    setGuardado(false);
                                }}
                            />
                        </section>

                        <section className="reservation-form-section">
                            <h2>Confirma tu horario</h2>
                            <p className="text-secondary">Los horarios se bloquean solo para el espacio seleccionado; puedes elegir otro horario disponible el mismo día.</p>
                            <form className="form-panel" onSubmit={manejarEnvio} noValidate>
                                <div className="form-field">
                                    <label htmlFor="fecha-reserva">Día seleccionado</label>
                                    <input id="fecha-reserva" type="date" className={`form-control ${errores.fecha ? "is-invalid" : ""}`} value={fecha} min={claveFecha(new Date())} onChange={(evento) => setFecha(evento.target.value)} required />
                                    {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
                                </div>
                                <div className="form-field">
                                    <label htmlFor="hora-reserva">Hora de inicio</label>
                                    <input id="hora-reserva" type="time" className={`form-control ${errores.hora ? "is-invalid" : ""}`} value={hora} onChange={(evento) => setHora(evento.target.value)} required />
                                    {errores.hora && <div className="invalid-feedback">{errores.hora}</div>}
                                </div>
                                <div className="form-field">
                                    <label htmlFor="duracion-reserva">Duración <span>(minutos)</span></label>
                                    <input id="duracion-reserva" type="number" min="1" max="1440" step="1" className={`form-control ${errores.tiempo ? "is-invalid" : ""}`} value={tiempo} onChange={(evento) => setTiempo(evento.target.value)} required />
                                    {errores.tiempo && <div className="invalid-feedback">{errores.tiempo}</div>}
                                </div>
                                <button type="submit" className="btn form-submit" disabled={guardando}>{guardando ? "Guardando…" : "Confirmar reserva"}</button>
                                {errorServidor && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorServidor}</div>}
                                {guardado && <div className="alert alert-success mt-3 mb-0" role="status">Reserva confirmada para {espacioSeleccionado?.nombre}. El calendario ya muestra el horario ocupado.</div>}
                            </form>
                        </section>
                    </div>
                )}
            </section>
        </main>
    );
}
