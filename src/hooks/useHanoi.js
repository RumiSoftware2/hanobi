import { useState } from 'react'

export const MIN_DISKS = 3
export const MAX_DISKS = 7
export const towerNames = ['Torre A', 'Torre B', 'Torre C']

function createTowers(count) {
  return [Array.from({ length: count }, (_, index) => count - index), [], []]
}

export default function useHanoi(initialCount = 4) {
  const [diskCount, setDiskCount] = useState(initialCount)
  const [towers, setTowers] = useState(() => createTowers(initialCount))
  const [moves, setMoves] = useState(0)
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('Selecciona el disco superior para comenzar.')

  const reset = (count = diskCount) => {
    setDiskCount(count)
    setTowers(createTowers(count))
    setMoves(0)
    setHistory([])
    setSelected(null)
    setMessage('Selecciona el disco superior para comenzar.')
  }

  const selectTower = (index) => {
    const tower = towers[index]
    if (selected === null) {
      if (!tower.length) {
        setMessage('Esa torre está vacía. Elige una torre con discos.')
        return
      }
      setSelected(index)
      setMessage(`Disco ${tower.at(-1)} seleccionado. Elige una torre de destino.`)
      return
    }
    if (selected === index) {
      setSelected(null)
      setMessage('Selección cancelada. Elige otro disco superior.')
      return
    }
    const disk = towers[selected].at(-1)
    const destinationTop = tower.at(-1)
    if (destinationTop && destinationTop < disk) {
      setMessage('Ese movimiento no es posible: un disco grande no puede ir sobre uno pequeño.')
      return
    }
    const next = towers.map((stack) => [...stack])
    next[selected].pop()
    next[index].push(disk)
    setHistory((items) => [...items, { towers, moves }])
    setTowers(next)
    setMoves((value) => value + 1)
    setSelected(null)
    setMessage(next[2].length === diskCount ? '¡Lo lograste! Has resuelto las Torres de Hanoi.' : `Disco ${disk} movido a ${towerNames[index]}.`)
  }

  const undo = () => {
    if (!history.length) return
    const previous = history.at(-1)
    setTowers(previous.towers)
    setMoves(previous.moves)
    setHistory((items) => items.slice(0, -1))
    setSelected(null)
    setMessage('Movimiento deshecho. Puedes intentarlo de nuevo.')
  }

  return { diskCount, towers, moves, selected, message, reset, selectTower, undo }
}
