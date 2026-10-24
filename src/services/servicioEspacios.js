import { clienteApi, prepararSolicitudSegura } from "./clienteApi";

const RUTA = "/espacios";

export async function listarEspacios() {
    const respuesta = await clienteApi.get(RUTA);
    return respuesta.data;
}

export async function guardarEspacio(espacio, foto) {
    await prepararSolicitudSegura();
    const formulario = new FormData();
    formulario.append("espacio", new Blob([JSON.stringify(espacio)], { type: "application/json" }));
    if (foto) formulario.append("foto", foto);
    const respuesta = await clienteApi.post(RUTA, formulario, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return respuesta.data;
}

export async function modificarEspacio(id, espacio) {
    await prepararSolicitudSegura();
    const respuesta = await clienteApi.put(`${RUTA}/${id}`, espacio);
    return respuesta.data;
}

export async function eliminarEspacio(id) {
    await prepararSolicitudSegura();
    await clienteApi.delete(`${RUTA}/${id}`);
}
