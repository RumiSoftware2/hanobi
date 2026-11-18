export default function HanoiStats({ diskCount, moves }) {
  return <section className="stats" aria-label="Información de la partida">
    <div className="stat"><span className="stat-icon">↗</span><span><small>Movimientos</small><strong>{moves}</strong></span></div>
    <div className="stat"><span className="stat-icon lavender">◉</span><span><small>Discos</small><strong>{diskCount}</strong></span></div>
    <div className="stat"><span className="stat-icon blue">✦</span><span><small>Mínimo teórico</small><strong>{2 ** diskCount - 1}</strong></span></div>
  </section>
}
