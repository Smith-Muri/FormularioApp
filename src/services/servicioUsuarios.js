import { clienteApi, prepararSolicitudSegura } from "./clienteApi";

const RUTA = '/usuarios'

export async function guardarUsuario(usuario) {
    await prepararSolicitudSegura();
    const respuesta = await clienteApi.post(RUTA, usuario);
    return respuesta.data;
}

export async function listarUsuarios() {
    const respuesta = await clienteApi.get(RUTA);
    return respuesta.data;
}

export async function modificarUsuario(id, usuario) {
    await prepararSolicitudSegura();
    const respuesta = await clienteApi.put(`${RUTA}/${id}`, usuario);
    return respuesta.data;
}

export async function eliminarUsuario(id) {
    await prepararSolicitudSegura();
    await clienteApi.delete(`${RUTA}/${id}`);
}