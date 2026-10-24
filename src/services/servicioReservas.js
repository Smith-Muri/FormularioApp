import { clienteApi, prepararSolicitudSegura } from "./clienteApi";

const RUTA = "/reservas";

export async function listarReservas() {
    const respuesta = await clienteApi.get(RUTA);
    return respuesta.data;
}

export async function guardarReserva(reserva) {
    await prepararSolicitudSegura();
    const respuesta = await clienteApi.post(RUTA, reserva);
    return respuesta.data;
}

export async function modificarReserva(id, reserva) {
    await prepararSolicitudSegura();
    const respuesta = await clienteApi.put(`${RUTA}/${id}`, reserva);
    return respuesta.data;
}

export async function eliminarReserva(id) {
    await prepararSolicitudSegura();
    await clienteApi.delete(`${RUTA}/${id}`);
}
