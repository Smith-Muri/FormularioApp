import { useState } from "react";
import { Link } from "react-router-dom";

export function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "",
  });

  const manejarCambios = (evento) => {
    const { name, value } = evento.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
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

          <form className="form-panel">
            <div className="form-field">
              <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Smith Murillo"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambios}
            />
            </div>

            <div className="form-field">
              <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="correo@ejemplo.com"
              name="email"
              value={formulario.email}
              onChange={manejarCambios}
            />
            </div>

            <div className="form-field">
              <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              name="password"
              value={formulario.password}
              onChange={manejarCambios}
            />
            </div>

            <div className="form-field">
              <label htmlFor="rol">Tipo de usuario</label>
            <select
              className="form-select"
              name="rol"
              value={formulario.rol}
              onChange={manejarCambios}
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
