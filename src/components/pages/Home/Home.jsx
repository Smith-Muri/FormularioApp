import { Link } from "react-router-dom";

export function Home() {
    return (
        <main className="home-page">
            <section className="container home-hero">
                <div className="home-hero-copy">
                    <p className="eyebrow">Gestión de espacios</p>
                    <h1>Reserva el lugar <em>ideal</em></h1>
                    <p className="home-lead">
                        Administra los espacios disponibles y crea reservas desde un solo lugar.
                    </p>
                    <div className="home-stat-row" aria-label="Resumen de la plataforma">
                        <span><strong>02</strong> gestiones rápidas</span>
                        <span><strong>01</strong> lugar para organizarlo todo</span>
                    </div>
                </div>
            </section>

            <section className="container home-actions">
                <div className="col-12 col-md-5">
                    <article className="action-card action-card-space">
                        <div className="action-card-top"><span className="action-number">01</span><span className="action-mark">+</span></div>
                        <h2>Registrar espacio</h2>
                        <p>Agrega un espacio con su descripción, capacidad y fotografía.</p>
                        <Link to="/espacios" className="action-link">Crear espacio <span aria-hidden="true">↗</span></Link>
                    </article>
                </div>
                <div className="col-12 col-md-5">
                    <article className="action-card action-card-reservation">
                        <div className="action-card-top"><span className="action-number">02</span><span className="action-mark">◷</span></div>
                        <h2>Hacer una reserva</h2>
                        <p>Programa una reserva indicando la fecha, hora y duración.</p>
                        <Link to="/reservas" className="action-link">Nueva reserva <span aria-hidden="true">↗</span></Link>
                    </article>
                </div>
            </section>
        </main>
    );
}