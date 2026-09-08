import { useState } from "react";
import { Link } from "react-router-dom";

export function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "",
  });
  const [errores, setErrores] = useState({});
  const [intentado, setIntentado] = useState(false);

  const validarCampo = (nombre, valor) => {
    if (!valor.trim()) return "Este campo es obligatorio.";
    if (nombre === "email" && !/^\S+@\S+\.\S+$/.test(valor)) return "Ingresa un correo válido.";
    if (nombre === "password" && valor.length < 6) return "Usa al menos 6 caracteres.";
    return "";
  };

  const manejarCambios = (evento) => {
    const { name, value } = evento.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (intentado || errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
    }
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    setIntentado(true);
    const nuevosErrores = Object.fromEntries(
      Object.entries(formulario).map(([nombre, valor]) => [nombre, validarCampo(nombre, valor)])
    );
    setErrores(nuevosErrores);
  };

  const validarAlSalir = (evento) => {
    const { name, value } = evento.target;
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  return (
    <main className="form-page">
      <section className="container form-layout">
      <section className="row w-100 justify-content-center">
        <section className="col-12 col-md-8 col-lg-6 form-column">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <p className="eyebrow form-eyebrow">Nuevo perfil</p>
          <h1>Formulario de registro</h1>
          <p className="form-intro">Completa tus datos para comenzar a gestionar tus espacios.</p>

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
            </div>

            <div className="form-field">
              <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              className={`form-control ${errores.email ? "is-invalid" : ""}`}
              placeholder="correo@ejemplo.com"
              name="email"
              value={formulario.email}
              onChange={manejarCambios}
              onBlur={validarAlSalir}
            />
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
            </div>

            <div className="form-field">
              <label htmlFor="rol">Tipo de usuario</label>
            <select
              className={`form-select ${errores.rol ? "is-invalid" : ""}`}
              name="rol"
              value={formulario.rol}
              onChange={manejarCambios}
              onBlur={validarAlSalir}
            >
              <option value="">Selecciona un rol</option>
              <option value="administrador">Administrador</option>
              <option value="inquilino">Inquilino</option>
            </select>
            </div>

            <button type="submit" className="btn form-submit">Crear perfil <span aria-hidden="true">↗</span></button>
          </form>
        </section>
      </section>
      </section>
    </main>
  );
}
