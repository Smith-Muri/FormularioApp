import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { guardarEspacio } from "../../../services/servicioEspacios";

export function Espacio() {
  const [espacio, setEspacio] = useState({
    nombre: "",
    descripcion: "",
    aforo: "",
  });
  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!foto) {
      setVistaPrevia("");
      return undefined;
    }
    const url = URL.createObjectURL(foto);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setEspacio((anterior) => ({ ...anterior, [name]: value }));
    setGuardado(false);
    setErrorServidor("");
    setErrores((anterior) => ({ ...anterior, [name]: "" }));
  }

  function manejarFoto(evento) {
    const archivo = evento.target.files?.[0] ?? null;
    setFoto(null);
    setGuardado(false);
    setErrorServidor("");
    if (!archivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
      setErrores((anterior) => ({ ...anterior, foto: "Selecciona una imagen JPG, PNG o WEBP." }));
      evento.target.value = "";
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setErrores((anterior) => ({ ...anterior, foto: "La imagen no puede superar 5 MB." }));
      evento.target.value = "";
      return;
    }
    setErrores((anterior) => ({ ...anterior, foto: "" }));
    setFoto(archivo);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    const formularioHtml = evento.currentTarget;
    const nuevosErrores = {
      nombre: espacio.nombre.trim() ? "" : "El nombre es obligatorio.",
      descripcion: espacio.descripcion.trim() ? "" : "La descripción es obligatoria.",
      aforo: Number.isInteger(Number(espacio.aforo)) && Number(espacio.aforo) > 0
        ? ""
        : "El aforo debe ser un número entero mayor que cero.",
      foto: foto || !errores.foto ? "" : errores.foto,
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setGuardando(true);
    setErrorServidor("");
    try {
      await guardarEspacio({
        nombre: espacio.nombre.trim(),
        descripcion: espacio.descripcion.trim(),
        aforo: Number(espacio.aforo),
      }, foto);
      setGuardado(true);
      setEspacio({ nombre: "", descripcion: "", aforo: "" });
      setFoto(null);
      formularioHtml.reset();
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : null;
      const detalle = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.response?.data?.message
        : null;
      if (status === 401 || status === 403) {
        setErrorServidor("Tu sesión no tiene permiso para crear espacios. Inicia sesión con una cuenta administradora.");
      } else {
        setErrorServidor(detalle || "No se pudo guardar el espacio. Verifica la conexión y vuelve a intentarlo.");
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="form-page">
      <div className="form-accent form-accent-space" aria-hidden="true" />
      <section className="container form-layout">
        <div className="row justify-content-center w-100">
          <div className="col-12 col-lg-8">
            <Link to="/administrador" className="back-link">← Volver al panel administrador</Link>
            <p className="eyebrow form-eyebrow">Administración de espacios</p>
            <h1>Crear espacio</h1>
            <p className="form-intro">Agrega el espacio y, si quieres, una fotografía para que los clientes puedan verlo y reservarlo.</p>

            <form className="form-panel" onSubmit={manejarEnvio} noValidate>
              <div className="form-field">
                <label htmlFor="nombre">Nombre del espacio</label>
                <input id="nombre" name="nombre" className={`form-control ${errores.nombre ? "is-invalid" : ""}`} placeholder="Ej. Sala Aurora" value={espacio.nombre} onChange={manejarCambio} required />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              </div>
              <div className="form-field">
                <label htmlFor="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" rows="4" className={`form-control ${errores.descripcion ? "is-invalid" : ""}`} value={espacio.descripcion} onChange={manejarCambio} required />
                {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
              </div>
              <div className="form-field">
                <label htmlFor="aforo">Aforo máximo</label>
                <input id="aforo" name="aforo" type="number" min="1" step="1" className={`form-control ${errores.aforo ? "is-invalid" : ""}`} value={espacio.aforo} onChange={manejarCambio} required />
                {errores.aforo && <div className="invalid-feedback">{errores.aforo}</div>}
              </div>
              <div className="form-field">
                <label htmlFor="foto">Fotografía del espacio</label>
                <input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" className={`form-control ${errores.foto ? "is-invalid" : ""}`} onChange={manejarFoto} />
                <small className="text-secondary">Opcional. Formatos JPG, PNG o WEBP; máximo 5 MB.</small>
                {errores.foto && <div className="invalid-feedback">{errores.foto}</div>}
                {vistaPrevia && <img className="space-photo-preview mt-3" src={vistaPrevia} alt="Vista previa de la fotografía del espacio" />}
              </div>
              <button type="submit" className="btn form-submit" disabled={guardando}>
                {guardando ? "Guardando espacio…" : "Guardar espacio"}
              </button>
              {errorServidor && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorServidor}</div>}
              {guardado && <div className="alert alert-success mt-3 mb-0" role="status">Espacio creado correctamente. Ya está disponible para reservar.</div>}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
