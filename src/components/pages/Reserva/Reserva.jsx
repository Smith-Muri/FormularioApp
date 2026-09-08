import { useState } from "react";
import { Link } from "react-router-dom";

const reservaInicial = {
  id: crypto.randomUUID(),
  fecha: "",
  tiempo: "",
};

export function Reserva() {
  const [reserva, setReserva] = useState(reservaInicial);
  const [enviado, setEnviado] = useState(false);
  const [errores, setErrores] = useState({});
  const [intentado, setIntentado] = useState(false);

  const validarCampo = (nombre, valor) => {
    if (!valor.trim()) return "Este campo es obligatorio.";
    if (nombre === "tiempo" && Number(valor) < 1) return "Ingresa una duración mayor que cero.";
    if (nombre === "fecha" && new Date(valor) < new Date()) return "Selecciona una fecha futura.";
    return "";
  };

  const manejarCambios = (evento) => {
    const { name, value } = evento.target;
    setReserva((prev) => ({ ...prev, [name]: value }));
    setEnviado(false);
    if (intentado || errores[name]) setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    setIntentado(true);
    const nuevosErrores = Object.fromEntries(
      Object.entries(reserva).filter(([nombre]) => nombre !== "id").map(([nombre, valor]) => [nombre, validarCampo(nombre, valor)])
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
      <div className="form-accent form-accent-reservation" aria-hidden="true" />
      <div className="container form-layout">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-7">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <p className="eyebrow form-eyebrow">Agenda</p>
          <h1>Hacer reserva</h1>
          <p className="form-intro">Elige el momento y el tiempo que necesitas para tu espacio.</p>

          <form className="form-panel" onSubmit={manejarEnvio} noValidate>
            <div className="form-field">
              <label htmlFor="fecha">Fecha y hora</label>
              <input id="fecha" name="fecha" type="datetime-local" className={`form-control ${errores.fecha ? "is-invalid" : ""}`} value={reserva.fecha} onChange={manejarCambios} onBlur={validarAlSalir} />
            </div>
            <div className="form-field">
              <label htmlFor="tiempo">Duración <span>(en minutos)</span></label>
              <input id="tiempo" name="tiempo" type="number" min="1" className={`form-control ${errores.tiempo ? "is-invalid" : ""}`} value={reserva.tiempo} onChange={manejarCambios} onBlur={validarAlSalir} />
            </div>
            <button type="submit" className="btn form-submit">Guardar reserva <span aria-hidden="true">↗</span></button>
            {enviado && <div className="alert alert-success mt-3 mb-0">Reserva lista para guardar.</div>}
          </form>
        </div>
      </div>
      </div>
    </main>
  );
}