import { useEffect, useMemo, useState } from "react";
import { cerrarSesion as cerrarSesionApi, iniciarSesion as iniciarSesionApi, obtenerUsuarioActual } from "../../services/servicioAutenticacion";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");

    useEffect(() => {
        let activo = true;
        obtenerUsuarioActual()
            .then((usuarioActual) => {
                if (activo) setUsuario(usuarioActual);
            })
            .catch((error) => {
                if (!activo) return;
                if (![401, 403].includes(error.response?.status)) {
                    setErrorCarga("No fue posible validar la sesión con el servidor.");
                }
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    const value = useMemo(() => ({
        usuario,
        cargando,
        errorCarga,
        async iniciarSesion(correo, contraseña) {
            const usuarioAutenticado = await iniciarSesionApi(correo, contraseña);
            setUsuario(usuarioAutenticado);
            setErrorCarga("");
            return usuarioAutenticado;
        },
        async cerrarSesion() {
            await cerrarSesionApi();
            setUsuario(null);
        },
    }), [usuario, cargando, errorCarga]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
