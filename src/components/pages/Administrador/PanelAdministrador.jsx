import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const acciones = [
    {
        ruta: "/administrador/espacios/nuevo",
        numero: "01",
        titulo: "Crear espacio",
        descripcion: "Publica un nuevo espacio con descripción, aforo y una fotografía opcional.",
        enlace: "Registrar espacio",
    },
    {
        ruta: "/administrador/espacios",
        numero: "02",
        titulo: "Gestionar espacios",
        descripcion: "Revisa el catálogo que ven los clientes y administra sus espacios.",
        enlace: "Abrir catálogo",
    },
    {
        ruta: "/administrador/reservas",
        numero: "03",
        titulo: "Calendario de reservas",
        descripcion: "Consulta las fechas y los horarios ocupados de cada espacio.",
        enlace: "Ver calendario",
    },
];

export function PanelAdministrador() {
    const { usuario, cerrarSesion } = useAuth();
    const [error, setError] = useState("");

    async function manejarCierreSesion() {
        setError("");
        try {
            await cerrarSesion();
        } catch {
            setError("No se pudo cerrar la sesión con el servidor. Inténtalo de nuevo.");
        }
    }

    return (
        <main className="home-page admin-page">
            <section className="container home-hero">
                <div className="home-hero-copy">
                    <p className="eyebrow">Administración</p>
                    <h1>Panel de <em>espacios</em></h1>
                    <p className="home-lead">Hola, {usuario?.nombres}. Administra el catálogo y consulta las reservas desde aquí.</p>
                    <button className="btn btn-outline-secondary" type="button" onClick={manejarCierreSesion}>Cerrar sesión</button>
                </div>
            </section>
            {error && <div className="container pb-4"><div className="alert alert-danger" role="alert">{error}</div></div>}
            <section className="container home-actions" aria-label="Herramientas del administrador">
                {acciones.map((accion) => (
                    <div className="col-12 col-md-5" key={accion.numero}>
                        <article className="action-card">
                            <div className="action-card-top"><span className="action-number">{accion.numero}</span><span className="action-mark">↗</span></div>
                            <h2>{accion.titulo}</h2>
                            <p>{accion.descripcion}</p>
                            <Link to={accion.ruta} className="action-link">{accion.enlace} <span aria-hidden="true">↗</span></Link>
                        </article>
                    </div>
                ))}
            </section>
        </main>
    );
}
