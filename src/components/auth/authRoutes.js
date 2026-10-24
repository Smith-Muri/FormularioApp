export function destinoPorRol(rol) {
    return rol?.toUpperCase() === "ADMINISTRADOR" ? "/administrador" : "/cliente";
}
