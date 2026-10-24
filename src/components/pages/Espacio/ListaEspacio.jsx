import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import { destinoPorRol } from "../../auth/authRoutes";
import { eliminarEspacio, listarEspacios } from "../../../services/servicioEspacios";

function TarjetaEspacio({ espacio, administrador, onEliminar }) {
    return (
        <article className="card h-100 border-0 shadow-sm overflow-hidden">
            {espacio.foto ? (
                <img src={espacio.foto} className="card-img-top space-card-photo" alt={`Vista de ${espacio.nombre}`} />
            ) : (
                <div className="space-card-placeholder" role="img" aria-label={`No hay fotografía de ${espacio.nombre}`}>Sin fotografía</div>
            )}
            <div className="card-body d-flex flex-column p-4">
                <p className="eyebrow mb-2">{administrador ? "Espacio administrado" : "Espacio disponible"}</p>
                <h2 className="h4">{espacio.nombre}</h2>
                <p className="card-text text-secondary flex-grow-1">{espacio.descripcion}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-secondary">Aforo: {espacio.aforo} personas</span>
                    {!administrador && <Link to={`/reservas?espacioId=${encodeURIComponent(espacio.id)}`} className="action-link">Ver calendario y reservar <span aria-hidden="true">↗</span></Link>}
                </div>
                {administrador && <button type="button" className="btn btn-outline-danger mt-3" onClick={() => onEliminar(espacio)}>Eliminar espacio</button>}
            </div>
        </article>
    );
}

export function ListaEspacios({ administrador = false }) {
    const { usuario } = useAuth();
    const rutaPanel = administrador ? "/administrador" : destinoPorRol(usuario?.rol);
    const [busqueda, setBusqueda] = useState("");
    const [espaciosIniciales, setEspaciosIniciales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [accion, setAccion] = useState("");

    useEffect(() => {
        let activo = true;
        listarEspacios()
            .then((datos) => {
                if (activo) setEspaciosIniciales(datos);
            })
            .catch((fallo) => {
                if (!activo) return;
                const mensaje = axios.isAxiosError(fallo) ? fallo.response?.data?.detail : "";
                setError(mensaje || "No se pudieron cargar los espacios. Comprueba que el backend esté activo.");
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    async function manejarEliminacion(espacio) {
        if (!window.confirm(`¿Eliminar "${espacio.nombre}"? Los espacios con reservas no se pueden eliminar.`)) return;
        setAccion("");
        try {
            await eliminarEspacio(espacio.id);
            setEspaciosIniciales((actuales) => actuales.filter((item) => item.id !== espacio.id));
        } catch (fallo) {
            const detalle = axios.isAxiosError(fallo) ? fallo.response?.data?.detail : "";
            setAccion(detalle || "No se pudo eliminar el espacio.");
        }
    }

    const espacios = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return espaciosIniciales;

        return espaciosIniciales.filter(({ nombre, descripcion }) =>
            `${nombre} ${descripcion}`.toLowerCase().includes(termino)
        );
    }, [busqueda, espaciosIniciales]);

    return (
        <main className="form-page">
            <div className="container py-5">
                <Link to={rutaPanel} className="back-link">← Volver al panel</Link>
                <p className="eyebrow form-eyebrow">{administrador ? "Administración" : "Catálogo"}</p>
                <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                    <div>
                        <h1>{administrador ? "Gestionar espacios" : "Espacios disponibles"}</h1>
                        <p className="form-intro mb-0">{administrador ? "Consulta los espacios publicados y administra el catálogo." : "Encuentra el lugar adecuado para tu próxima actividad."}</p>
                    </div>
                    {administrador && <Link to="/administrador/espacios/nuevo" className="btn form-submit px-4 w-auto">Crear espacio <span aria-hidden="true">+</span></Link>}
                </div>
                {accion && <div className="alert alert-danger" role="alert">{accion}</div>}

                <div className="mb-4">
                    <label htmlFor="buscar-espacio" className="visually-hidden">Buscar espacio</label>
                    <input
                        id="buscar-espacio"
                        type="search"
                        className="form-control"
                        placeholder="Buscar por nombre o descripción"
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                </div>

                {cargando ? (
                    <p role="status">Cargando espacios…</p>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">{error}</div>
                ) : espacios.length > 0 ? (
                    <section className="row g-4" aria-label="Lista de espacios">
                        {espacios.map((espacio) => (
                            <div className="col-12 col-md-6 col-lg-4" key={espacio.id}>
                                <TarjetaEspacio espacio={espacio} administrador={administrador} onEliminar={manejarEliminacion} />
                            </div>
                        ))}
                    </section>
                ) : (
                    <div className="alert alert-light border" role="status">
                        No encontramos espacios que coincidan con tu búsqueda.
                    </div>
                )}
            </div>
        </main>
    );
}