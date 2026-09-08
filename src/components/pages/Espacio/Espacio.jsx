import { useState } from "react";
import { Link } from "react-router-dom";

const espacioInicial = {
  id: crypto.randomUUID(),
  nombre: "",
  descripcion: "",
  foto: "",
  aforo: "",
};

export function Espacio() {
  const [espacio, setEspacio] = useState(espacioInicial);
  const [enviado, setEnviado] = useState(false);
  const [errores, setErrores] = useState({});
  const [intentado, setIntentado] = useState(false);

  const validarCampo = (nombre, valor) => {
    if (!valor.trim()) return "Este campo es obligatorio.";
    if (nombre === "foto" && !/^https?:\/\/\S+/.test(valor)) return "Ingresa una URL válida.";
    if (nombre === "aforo" && Number(valor) < 1) return "Ingresa un aforo mayor que cero.";
    return "";
  };

  const manejarCambios = (evento) => {
    const { name, value } = evento.target;
    setEspacio((prev) => ({ ...prev, [name]: value }));
    setEnviado(false);
    if (intentado || errores[name]) setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    setIntentado(true);
    const nuevosErrores = Object.fromEntries(
      Object.entries(espacio).filter(([nombre]) => nombre !== "id").map(([nombre, valor]) => [nombre, validarCampo(nombre, valor)])
    );
    setErrores(nuevosErrores);
    setEnviado(Object.values(nuevosErrores).every((error) => !error));
  };

  const validarAlSalir = (evento) => {
    const { name, value } = evento.target;
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  return (
    <main className="form-page">
      <div className="form-accent form-accent-space" aria-hidden="true" />
      <div className="container form-layout">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-7">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <p className="eyebrow form-eyebrow">Catálogo</p>
          <h1>Registrar espacio</h1>
          <p className="form-intro">Dale una identidad clara a cada lugar disponible.</p>

          <form className="form-panel" onSubmit={manejarEnvio} noValidate>
            <div className="form-field">
              <label htmlFor="nombre">Nombre del espacio</label>
              <input id="nombre" name="nombre" type="text" className={`form-control ${errores.nombre ? "is-invalid" : ""}`} placeholder="Ej. Sala Aurora" value={espacio.nombre} onChange={manejarCambios} onBlur={validarAlSalir} />
            </div>
            <div className="form-field">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion" className={`form-control ${errores.descripcion ? "is-invalid" : ""}`} rows="4" value={espacio.descripcion} onChange={manejarCambios} onBlur={validarAlSalir} />
            </div>
            <div className="form-field">
              <label htmlFor="foto">URL de la foto</label>
              <input id="foto" name="foto" type="url" className={`form-control ${errores.foto ? "is-invalid" : ""}`} placeholder="https://ejemplo.com/foto.jpg" value={espacio.foto} onChange={manejarCambios} onBlur={validarAlSalir} />
            </div>
            <div className="form-field">
              <label htmlFor="aforo">Aforo máximo</label>
              <input id="aforo" name="aforo" type="number" min="1" className={`form-control ${errores.aforo ? "is-invalid" : ""}`} value={espacio.aforo} onChange={manejarCambios} onBlur={validarAlSalir} />
            </div>
            <button type="submit" className="btn form-submit">Guardar espacio <span aria-hidden="true">↗</span></button>
            {enviado && <div className="alert alert-success mt-3 mb-0">Espacio listo para guardar.</div>}
          </form>
        </div>
      </div>
      </div>
    </main>
  );
}