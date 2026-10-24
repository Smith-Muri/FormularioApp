import { clienteApi, prepararSolicitudSegura } from "./clienteApi";

export async function iniciarSesion(correo, contraseña) {
    await prepararSolicitudSegura();
    const respuesta = await clienteApi.post("/auth/login", { correo, contraseña });
    await prepararSolicitudSegura();
    return respuesta.data;
}

export async function obtenerUsuarioActual() {
    const respuesta = await clienteApi.get("/auth/me");
    return respuesta.data;
}

export async function cerrarSesion() {
    await prepararSolicitudSegura();
    await clienteApi.post("/auth/logout");
}
