import { clienteApi } from "./clienteApi";

const RUTA = '/usuarios';

export async function guardarUsuario(usuario){
  try{
    const respuesta = await clienteApi.post(RUTA, usuario)
    return respuesta.data
  }catch(error){
    console.error("Error guardando el usuario", error)
    throw error
  }
}



export async function listarUsuarios(){
  try {
    const respuesta = await clienteApi.get(RUTA)
    return respuesta.data
  } catch (error) {
    console.error("Error al listar los usuarios", error)
    throw error
  }
}


export async function modificarUsuario(id, usuario){
  try {
    const respuesta = await clienteApi.put(RUTA + '/' + id, usuario)
    return respuesta.data
  } catch (error) {
    console.error("Error al modificar el usuario", error)
    throw error
  }
}

export async function eliminarUsuario(id) {
  try {
    const respuesta = await clienteApi.delete(RUTA + '/' + id)
    return respuesta.data
  } catch (error) {
    console.error("Error al eliminar el usuario", error)
    throw error
  }
}