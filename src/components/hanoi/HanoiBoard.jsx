import { towerNames } from '../../hooks/useHanoi'

export default function HanoiBoard({ towers, selected, onTowerClick }) {
  return <div className="board">
    {towers.map((tower, index) => <button key={index} type="button" className={`tower ${selected === index ? 'tower-selected' : ''}`} onClick={() => onTowerClick(index)} aria-label={`${towerNames[index]}, ${tower.length} discos${selected === index ? ', origen seleccionado' : ''}`}>
      <span className="tower-label">{towerNames[index]}</span>
      <span className="tower-well"><span className="pole" />
        <span className="disk-stack">{[...tower].reverse().map((disk) => <span key={disk} className={`disk disk-${disk} ${disk === tower.at(-1) ? 'disk-top' : ''}`} style={{ '--disk-width': `${34 + disk * 8}%` }} aria-label={`Disco ${disk}`} />)}</span>
        <span className="base" />
      </span>
      <span className="tower-hint">{tower.length ? `${tower.length} ${tower.length === 1 ? 'disco' : 'discos'}` : 'Vacía'}</span>
    </button>)}
  </div>
}
