import './App.css'
import HanoiBoard from './components/hanoi/HanoiBoard'
import HanoiStats from './components/hanoi/HanoiStats'
import useHanoi, { MAX_DISKS, MIN_DISKS } from './hooks/useHanoi'

function App() {
  const game = useHanoi()
  const won = game.towers[2].length === game.diskCount

  return <main className="app-shell">
    <header className="page-header">
      <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
      <p className="eyebrow">UN RETO PARA TU MENTE</p>
      <h1>Torres de <em>Hanoi</em></h1>
      <p className="subtitle">Explora, mueve y descubre patrones matemáticos.</p>
    </header>

    <HanoiStats diskCount={game.diskCount} moves={game.moves} />

    <section className="game-card" aria-label="Juego de Torres de Hanoi">
      <div className="game-topline"><div><span className="section-kicker">TU TABLERO</span><h2>¿Puedes resolverlo?</h2></div><label className="disk-picker">Discos <select value={game.diskCount} onChange={(event) => game.reset(Number(event.target.value))} aria-label="Cantidad de discos">{Array.from({ length: MAX_DISKS - MIN_DISKS + 1 }, (_, i) => i + MIN_DISKS).map((n) => <option key={n} value={n}>{n} discos</option>)}</select></label></div>
      <HanoiBoard towers={game.towers} selected={game.selected} onTowerClick={game.selectTower} />
      <div className={`game-message ${won ? 'success' : ''}`} role="status"><span className="message-dot" />{won ? <>¡Resolviste las Torres de Hanoi en <strong>{game.moves} movimientos</strong>! El mínimo era <strong>{2 ** game.diskCount - 1}</strong>.</> : game.message}</div>
      <div className="controls"><button className="button button-primary" onClick={() => game.reset()} type="button"><span>↻</span> Reiniciar</button><button className="button button-secondary" onClick={game.undo} disabled={!game.moves} type="button"><span>↶</span> Deshacer movimiento</button>{game.selected !== null && <button className="button button-quiet" onClick={() => game.selectTower(game.selected)} type="button">Cancelar selección</button>}</div>
    </section>

    <section className="howto"><div className="howto-heading"><span className="section-kicker">CÓMO JUGAR</span><h2>Tres reglas, un gran reto</h2></div><div className="rules"><div className="rule"><span>01</span><p>Mueve <strong>un disco a la vez.</strong></p></div><div className="rule"><span>02</span><p>Solo puedes mover el disco <strong>de arriba.</strong></p></div><div className="rule"><span>03</span><p>No pongas uno grande sobre <strong>uno pequeño.</strong></p></div></div></section>
    <footer>Un clásico de la matemática · <span>2ⁿ − 1 movimientos mínimos</span></footer>
  </main>
}

export default App
