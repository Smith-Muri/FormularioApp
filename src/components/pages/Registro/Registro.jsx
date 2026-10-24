import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { guardarUsuario } from "../../../services/servicioUsuarios";

function mensajeError(error) {
  if (!axios.isAxiosError(error) || !error.response) {
    return "No se pudo conectar con el servidor. Comprueba que Java esté activo en el puerto 8080.";
  }
  if (error.response.status === 409) {
    return "Ya existe un perfil con ese correo. Inicia sesión o usa otro correo.";
  }
  if (error.response.status === 401 || error.response.status === 403) {
    return "El servidor rechazó la solicitud de seguridad. Recarga la página e inténtalo de nuevo.";
  }
  const mensajeServidor = error.response.data?.detail || error.response.data?.message;
  return mensajeServidor || `El servidor rechazó el registro (HTTP ${error.response.status}).`;
}

export function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [errores, setErrores] = useState({});
  const [intentado, setIntentado] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");
  const [creado, setCreado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const validarCampo = (nombre, valor) => {
    if (!valor.trim()) return "Este campo es obligatorio.";
    if (nombre === "email" && !/^\S+@\S+\.\S+$/.test(valor)) return "Ingresa un correo válido.";
    if (nombre === "password" && valor.length < 8) return "Usa al menos 8 caracteres.";
    return "";
  };

  const manejarCambios = (evento) => {
    const { name, value } = evento.target;
    setCreado(false);
    setErrorServidor("");
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (intentado || errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
    }
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setIntentado(true);
    const nuevosErrores = Object.fromEntries(
      Object.entries(formulario).map(([nombre, valor]) => [nombre, validarCampo(nombre, valor)])
    );
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setEnviando(true);
    setErrorServidor("");
    try {
      await guardarUsuario({
        nombres: formulario.nombre,
        correo: formulario.email,
        contraseña: formulario.password,
      });
      setCreado(true);
    } catch (error) {
      setErrorServidor(mensajeError(error));
    } finally {
      setEnviando(false);
    }
  };

  const validarAlSalir = (evento) => {
    const { name, value } = evento.target;
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const mensajeCampo = (nombre) => errores[nombre]
    ? <div className="invalid-feedback">{errores[nombre]}</div>
    : null;

  return (
    <main className="form-page">
      <section className="container form-layout">
      <section className="row w-100 justify-content-center">
        <section className="col-12 col-md-8 col-lg-6 form-column">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <p className="eyebrow form-eyebrow">Nuevo perfil</p>
          <h1>Formulario de registro</h1>
          <p className="form-intro">Crea un perfil de cliente para iniciar sesión y gestionar reservas.</p>

          <form className="form-panel" onSubmit={manejarEnvio} noValidate>
            <div className="form-field">
              <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
              placeholder="Smith Murillo"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambios}
              onBlur={validarAlSalir}
            />
            {mensajeCampo("nombre")}
            </div>

            <div className="form-field">
              <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              className={`form-control ${errores.email ? "is-invalid" : ""}`}
              placeholder="correo@ejemplo.com"
              id="email"
              name="email"
              value={formulario.email}
              onChange={manejarCambios}
              onBlur={validarAlSalir}
            />
            {mensajeCampo("email")}
            </div>

            <div className="form-field">
              <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              className={`form-control ${errores.password ? "is-invalid" : ""}`}
              placeholder="Contraseña"
              name="password"
              value={formulario.password}
              onChange={manejarCambios}
              onBlur={validarAlSalir}
            />
            {mensajeCampo("password")}
            </div>

            <button type="submit" className="btn form-submit" disabled={enviando || creado}>{enviando ? "Creando perfil…" : "Crear perfil"} <span aria-hidden="true">↗</span></button>
            {errorServidor && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorServidor}</div>}
            {creado && <div className="alert alert-success mt-3 mb-0" role="status">
              Perfil de cliente creado. <Link to="/iniciar-sesion">Inicia sesión para continuar.</Link>
              {" "}Para registrar espacios necesitas una cuenta de administrador.
            </div>}
          </form>
        </section>
      </section>
      </section>
    </main>
  );
}
