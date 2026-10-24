import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { destinoPorRol } from "../../auth/authRoutes";
import axios from "axios";

function mensajeError(error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        return "Correo o contraseña incorrectos.";
    }
    return "No se pudo iniciar sesión. Verifica que el backend esté disponible e inténtalo de nuevo.";
}

export function InicioSesion() {
    const { usuario, iniciarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    if (usuario) return <Navigate to={destinoPorRol(usuario.rol)} replace />;

    async function manejarEnvio(evento) {
        evento.preventDefault();
        setEnviando(true);
        setError("");
        try {
            const usuarioAutenticado = await iniciarSesion(correo, contraseña);
            navigate(location.state?.from?.pathname || destinoPorRol(usuarioAutenticado.rol), { replace: true });
        } catch (errorInicioSesion) {
            setError(mensajeError(errorInicioSesion));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="form-page">
            <section className="container form-layout">
                <section className="row w-100 justify-content-center">
                    <section className="col-12 col-md-8 col-lg-6 form-column">
                        <Link to="/" className="back-link">← Volver al inicio</Link>
                        <p className="eyebrow form-eyebrow">Acceso seguro</p>
                        <h1>Iniciar sesión</h1>
                        <p className="form-intro">Ingresa con tu cuenta para abrir el espacio de acuerdo con tu rol.</p>
                        <form className="form-panel" onSubmit={manejarEnvio}>
                            <div className="form-field">
                                <label htmlFor="correo">Correo electrónico</label>
                                <input id="correo" name="correo" type="email" autoComplete="username" className="form-control" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                            </div>
                            <div className="form-field">
                                <label htmlFor="contraseña">Contraseña</label>
                                <input id="contraseña" name="contraseña" type="password" autoComplete="current-password" className="form-control" value={contraseña} onChange={(e) => setContraseña(e.target.value)} required />
                            </div>
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            <button type="submit" className="btn form-submit" disabled={enviando}>{enviando ? "Ingresando…" : "Iniciar sesión"}</button>
                        </form>
                    </section>
                </section>
            </section>
        </main>
    );
}
