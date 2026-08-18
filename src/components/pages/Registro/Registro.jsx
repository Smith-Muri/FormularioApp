import { useState } from "react";

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
    <section className="container min-vh-100 d-flex align-items-center justify-content-center">
      <section className="row w-100 justify-content-center">
        <section className="col-12 col-md-8 col-lg-6">
          <h1 className="text-center">Formulario de Registro</h1>
          <hr />

          <form className="border rounded p-5 shadow bg-white">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Smith Murillo"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambios}
            />

            <input
              type="email"
              className="form-control mb-3"
              placeholder="correo@ejemplo.com"
              name="email"
              value={formulario.email}
              onChange={manejarCambios}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Contraseña"
              name="password"
              value={formulario.password}
              onChange={manejarCambios}
            />

            <select
              className="form-select mb-3"
              name="rol"
              value={formulario.rol}
              onChange={manejarCambios}
            >
              <option value="">Selecciona un rol</option>
              <option value="administrador">Administrador</option>
              <option value="inquilino">Inquilino</option>
            </select>

            <button type="submit" className="btn btn-primary w-100">
              Enviar
            </button>
          </form>
        </section>
      </section>
    </section>
  );
}
