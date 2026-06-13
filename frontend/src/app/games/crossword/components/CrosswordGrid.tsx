'use client'
import { useState, useEffect, useCallback } from 'react'
import type { CrosswordItem } from '@/types'

interface Cell {
  row: number
  col: number
  char: string
  wordIndex: number
  userChar: string
  active: boolean
}

interface Props {
  words: CrosswordItem[]
  onComplete: () => void
  onCellCorrect?: () => void
}

export default function CrosswordGrid({ words, onComplete, onCellCorrect }: Props) {
  const [cells, setCells] = useState<Map<string, Cell>>(new Map())
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 })
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!words.length) return
    const cellMap = new Map<string, Cell>()
    let maxRow = 0, maxCol = 0
    let row = 2, col = 2

    words.forEach((item, wi) => {
      const horizontal = wi % 2 === 0
      for (let i = 0; i < item.word.length; i++) {
        const r = horizontal ? row : row + i
        const c = horizontal ? col + i : col
        const key = `${r},${c}`
        cellMap.set(key, {
          row: r, col: c, char: item.word[i],
          wordIndex: wi, userChar: '', active: true
        })
        maxRow = Math.max(maxRow, r + 1)
        maxCol = Math.max(maxCol, c + 1)
      }
      if (horizontal) { row += 2; col += 1 }
      else { row += 1; col += 3 }
    })

    setGridSize({ rows: maxRow + 2, cols: maxCol + 2 })
    setCells(cellMap)
  }, [words])

  const handleChange = useCallback((key: string, value: string) => {
    if (completed || !value.match(/^[\u0621-\u064A\s]?$/)) return
    setCells(prev => {
      const newCells = new Map(prev)
      const cell = newCells.get(key)
      if (cell) {
        cell.userChar = value
        newCells.set(key, cell)
        if (value === cell.char) onCellCorrect?.()
      }

      const allFilled = Array.from(newCells.values()).every(c => c.userChar)
      const allCorrect = Array.from(newCells.values()).every(c => c.userChar === c.char)
      if (allFilled && allCorrect) {
        setTimeout(() => { setCompleted(true); onComplete() }, 300)
      }
      return newCells
    })
  }, [completed, onComplete])

  const grid = []
  for (let r = 0; r < gridSize.rows; r++) {
    const row = []
    for (let c = 0; c < gridSize.cols; c++) {
      const cell = cells.get(`${r},${c}`)
      row.push(
        <div key={`${r}-${c}`} className="w-10 h-10 flex items-center justify-center">
          {cell ? (
            <input
              type="text"
              maxLength={1}
              value={cell.userChar}
              onChange={(e) => handleChange(`${r},${c}`, e.target.value)}
              className={`w-10 h-10 text-center text-lg font-bold border-2 rounded-lg
                transition-all duration-200 outline-none
                ${cell.userChar === cell.char && cell.userChar ? 'bg-emerald-100 border-emerald-400 text-emerald-800' :
                  cell.userChar ? 'bg-primary-100 border-primary-400 text-primary-800' :
                  'bg-white border-gray-300 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
              dir="auto"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-lg" />
          )}
        </div>
      )
    }
    grid.push(<div key={r} className="flex gap-0.5 justify-center">{row}</div>)
  }

  return <div className="p-4 bg-gray-50 rounded-3xl inline-block">{grid}</div>
}
