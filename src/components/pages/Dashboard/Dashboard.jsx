import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

function PanelInicio({ administrador }) {
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
        <main className="form-page">
            <section className="container py-5">
                <p className="eyebrow">{administrador ? "Panel administrativo" : "Área de cliente"}</p>
                <h1>Hola, {usuario?.nombres}</h1>
                <p className="form-intro">Sesión activa como {administrador ? "administrador" : "cliente"}.</p>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <div className="d-flex flex-wrap gap-3">
                    <Link className="btn form-submit px-4 w-auto" to="/espacios">Ver espacios</Link>
                    {administrador && <Link className="btn form-submit px-4 w-auto" to="/espacios/crear">Registrar espacio</Link>}
                    <Link className="btn form-submit px-4 w-auto" to="/reservas">Reservas</Link>
                    <button className="btn btn-outline-secondary" type="button" onClick={manejarCierreSesion}>Cerrar sesión</button>
                </div>
            </section>
        </main>
    );
}

export function DashboardCliente() {
    return <PanelInicio administrador={false} />;
}

export function DashboardAdministrador() {
    return <PanelInicio administrador />;
}
