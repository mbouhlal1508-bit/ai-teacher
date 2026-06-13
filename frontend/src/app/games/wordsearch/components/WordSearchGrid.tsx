'use client'
import { useState, useEffect } from 'react'

const ARABIC_LETTERS = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'

interface Props {
  words: string[]
  onFound: (index: number) => void
}

export default function WordSearchGrid({ words, onFound }: Props) {
  const gridSize = 12
  const [grid, setGrid] = useState<string[][]>([])
  const [selected, setSelected] = useState<[number, number][]>([])
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())

  useEffect(() => {
    generateGrid()
  }, [words])

  const generateGrid = () => {
    const g: string[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => '')
    )

    const directions: [number, number][] = [
      [0, 1], [1, 0], [1, 1], [-1, 1]
    ]

    words.forEach((word) => {
      let placed = false
      let attempts = 0
      while (!placed && attempts < 100) {
        attempts++
        const dir = directions[Math.floor(Math.random() * directions.length)]
        const startRow = Math.floor(Math.random() * gridSize)
        const startCol = Math.floor(Math.random() * gridSize)
        const endRow = startRow + dir[0] * (word.length - 1)
        const endCol = startCol + dir[1] * (word.length - 1)
        if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) continue

        let canPlace = true
        for (let i = 0; i < word.length; i++) {
          const r = startRow + dir[0] * i
          const c = startCol + dir[1] * i
          if (g[r][c] && g[r][c] !== word[i]) { canPlace = false; break }
        }
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const r = startRow + dir[0] * i
            const c = startCol + dir[1] * i
            g[r][c] = word[i]
          }
          placed = true
        }
      }
    })

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!g[r][c]) g[r][c] = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)]
      }
    }

    setGrid(g)
  }

  const handleCellClick = (row: number, col: number) => {
    if (selected.length > 0) {
      const last = selected[selected.length - 1]
      const dr = Math.abs(row - last[0])
      const dc = Math.abs(col - last[1])
      if (dr > 1 || dc > 1 || (dr === 0 && dc === 0)) {
        setSelected([])
        return
      }
    }
    setSelected(prev => [...prev, [row, col]])
  }

  useEffect(() => {
    if (selected.length < 2) return
    const word = selected.map(([r, c]) => grid[r]?.[c]).join('')
    const reversed = word.split('').reverse().join('')
    const matchedIndex = words.findIndex((w, i) =>
      (w === word || w === reversed) && !foundWords.has(w)
    )
    if (matchedIndex !== -1) {
      setFoundWords(prev => new Set(prev).add(words[matchedIndex]))
      onFound(matchedIndex)
      setSelected([])
    }
  }, [selected])

  return (
    <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-gray-200">
      {grid.map((row, r) => (
        <div key={r} className="flex gap-0.5 justify-center">
          {row.map((char, c) => {
            const isSelected = selected.some(([sr, sc]) => sr === r && sc === c)
            return (
              <button key={c} onClick={() => handleCellClick(r, c)}
                className={`w-9 h-9 flex items-center justify-center text-lg font-bold rounded-lg transition-all
                  ${isSelected ? 'bg-primary-500 text-white shadow-md scale-110' : 'bg-gray-50 text-gray-700 hover:bg-primary-100'}`}>
                {char}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
