import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { CalendarioAdministrador } from "../pages/Administrador/CalendarioAdministrador";
import { PanelAdministrador } from "../pages/Administrador/PanelAdministrador";
import { InicioSesion } from "../pages/Autenticacion/InicioSesion";
import { DashboardCliente } from "../pages/Dashboard/Dashboard";
import { Espacio } from "../pages/Espacio/Espacio";
import { ListaEspacios } from "../pages/Espacio/ListaEspacio";
import { Home } from "../pages/Home/Home";
import { Registro } from "../pages/Registro/Registro";
import { Reserva } from "../pages/Reserva/Reserva";

export function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/iniciar-sesion" element={<InicioSesion />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/cliente" element={<ProtectedRoute roles={["USUARIO"]} />}>
                    <Route index element={<DashboardCliente />} />
                </Route>
                <Route path="/espacios" element={<ListaEspacios />} />
                <Route path="/reservas" element={<Reserva />} />
            </Route>

            <Route path="/administrador" element={<ProtectedRoute roles={["ADMINISTRADOR"]} />}>
                <Route index element={<PanelAdministrador />} />
                <Route path="espacios" element={<ListaEspacios administrador />} />
                <Route path="espacios/nuevo" element={<Espacio />} />
                <Route path="reservas" element={<CalendarioAdministrador />} />
            </Route>
            <Route path="/espacios/crear" element={<Navigate to="/administrador/espacios/nuevo" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}