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

  const manejarCambios = (evento) => {
    const { name, value } = evento.target;
    setReserva((prev) => ({ ...prev, [name]: value }));
    setEnviado(false);
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    setEnviado(true);
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

          <form className="form-panel" onSubmit={manejarEnvio}>
            <div className="form-field">
              <label htmlFor="fecha">Fecha y hora</label>
              <input id="fecha" name="fecha" type="datetime-local" className="form-control" value={reserva.fecha} onChange={manejarCambios} required />
            </div>
            <div className="form-field">
              <label htmlFor="tiempo">Duración <span>(en minutos)</span></label>
              <input id="tiempo" name="tiempo" type="number" min="1" className="form-control" value={reserva.tiempo} onChange={manejarCambios} required />
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