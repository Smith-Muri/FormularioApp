import { clienteApi } from "./clienteApi";

const RUTA = '/reservas';

export async function guardarReserva(reserva){
  try{
    const respuesta = await clienteApi.post(RUTA, reserva)
    return respuesta.data
  }catch(error){
    console.error("Error guardando la reserva", error)
    throw error
  }
}

export async function listarReservas(){
  try {
    const respuesta = await clienteApi.get(RUTA)
    return respuesta.data
  } catch (error) {
    console.error("Error al listar las reservas", error)
    throw error
  }
}

export async function modificarReserva(id, reserva){
  try {
    const respuesta = await clienteApi.put(RUTA + '/' + id, reserva)
    return respuesta.data
  } catch (error) {
    console.error("Error al modificar la reserva", error)
    throw error
  }
}

export async function eliminarReserva(id) {
  try {
    const respuesta = await clienteApi.delete(RUTA + '/' + id)
    return respuesta.data
  } catch (error) {
    console.error("Error al eliminar la reserva", error)
    throw error
  }
}