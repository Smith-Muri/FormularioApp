import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { destinoPorRol } from "./authRoutes";

export function ProtectedRoute({ roles }) {
    const { usuario, cargando, errorCarga } = useAuth();
    const location = useLocation();

    if (cargando) {
        return <main className="container py-5" role="status">Validando sesión…</main>;
    }

    if (errorCarga) {
        return <main className="container py-5"><div className="alert alert-danger" role="alert">{errorCarga}</div></main>;
    }

    if (!usuario) {
        return <Navigate to="/iniciar-sesion" replace state={{ from: location }} />;
    }

    if (roles && !roles.includes(usuario.rol?.toUpperCase())) {
        return <Navigate to={destinoPorRol(usuario.rol)} replace />;
    }

    return <Outlet />;
}
