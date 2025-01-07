'use client'

import { useEffect, useRef } from 'react'
import type { Bet, BetType } from './types'

interface RouletteTableProps {
  selectedChip: number
  disabled: boolean
  onBetPlaced: (bet: Bet) => void
  currentBets: Bet[]
}

interface BettingArea {
  type: BetType
  numbers: number[]
  x: number
  y: number
  width: number
  height: number
}

export function RouletteTable({ selectedChip, disabled, onBetPlaced, currentBets }: RouletteTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bettingAreasRef = useRef<BettingArea[]>([])

  const handleTableClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked betting area
    const clickedArea = bettingAreasRef.current.find(area => 
      x >= area.x && 
      x <= area.x + area.width && 
      y >= area.y && 
      y <= area.y + area.height
    )

    if (clickedArea) {
      const bet: Bet = {
        type: clickedArea.type,
        amount: selectedChip,
        numbers: clickedArea.numbers
      }
      onBetPlaced(bet)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellWidth = 60
    const cellHeight = 60
    const startX = 60  // Leave space for 0

    const drawTable = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw background
      ctx.fillStyle = '#006400'  // Dark green
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw zero
      ctx.fillStyle = '#008000'
      ctx.fillRect(0, 0, startX, cellHeight * 3)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('0', startX / 2, cellHeight * 1.5)

      // Draw numbers 1-36
      const bettingAreas: BettingArea[] = []
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 12; col++) {
          const number = (3 - row) + (col * 3)
          const x = startX + (col * cellWidth)
          const y = row * cellHeight

          // Draw cell background
          ctx.fillStyle = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
            .includes(number) ? '#FF0000' : '#000000'
          ctx.fillRect(x, y, cellWidth, cellHeight)

          // Draw number
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(number.toString(), x + cellWidth / 2, y + cellHeight / 2)

          // Add to betting areas
          bettingAreas.push({
            type: 'straight',
            numbers: [number],
            x,
            y,
            width: cellWidth,
            height: cellHeight
          })
        }
      }

      // Draw betting options
      const optionsY = cellHeight * 3
      const options = ['1st 12', '2nd 12', '3rd 12']
      options.forEach((text, i) => {
        const x = startX + (i * cellWidth * 4)
        ctx.fillStyle = '#008000'
        ctx.fillRect(x, optionsY, cellWidth * 4, cellHeight)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(text, x + (cellWidth * 2), optionsY + cellHeight / 2)

        bettingAreas.push({
          type: 'dozen',
          numbers: Array.from({ length: 12 }, (_, j) => j + 1 + (i * 12)),
          x,
          y: optionsY,
          width: cellWidth * 4,
          height: cellHeight
        })
      })

      // Draw outside bets
      const outsideBets = [
        { text: '1-18', type: '1-18' as BetType, numbers: Array.from({length: 18}, (_, i) => i + 1) },
        { text: 'EVEN', type: 'even' as BetType, numbers: Array.from({length: 36}, (_, i) => i + 1).filter(n => n % 2 === 0) },
        { text: 'RED', type: 'red' as BetType, numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36] },
        { text: 'BLACK', type: 'black' as BetType, numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35] },
        { text: 'ODD', type: 'odd' as BetType, numbers: Array.from({length: 36}, (_, i) => i + 1).filter(n => n % 2 !== 0) },
        { text: '19-36', type: '19-36' as BetType, numbers: Array.from({length: 18}, (_, i) => i + 19) },
      ]

      const outsideBetsY = cellHeight * 4
      outsideBets.forEach((bet, i) => {
        const x = startX + (i * cellWidth * 2)
        ctx.fillStyle = '#008000'
        ctx.fillRect(x, outsideBetsY, cellWidth * 2, cellHeight)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(bet.text, x + cellWidth, outsideBetsY + cellHeight / 2)

        bettingAreas.push({
          type: bet.type,
          numbers: bet.numbers,
          x,
          y: outsideBetsY,
          width: cellWidth * 2,
          height: cellHeight
        })
      })

      // Draw current bets
      currentBets.forEach(bet => {
        const area = bettingAreas.find(a => 
          a.type === bet.type && 
          JSON.stringify(a.numbers) === JSON.stringify(bet.numbers)
        )
        if (area) {
          ctx.beginPath()
          ctx.arc(area.x + area.width / 2, area.y + area.height / 2, 15, 0, Math.PI * 2)
          ctx.fillStyle = '#FFD700'
          ctx.fill()
          ctx.fillStyle = '#000000'
          ctx.fillText(bet.amount.toString(), area.x + area.width / 2, area.y + area.height / 2)
        }
      })

      bettingAreasRef.current = bettingAreas
    }

    drawTable()
  }, [currentBets])

  return (
    <div className="w-full max-w-[800px] mx-auto">
        <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onClick={handleTableClick}
            className="border rounded-lg cursor-pointer"
            style={{ opacity: disabled ? 0.7 : 1 }}
        />
    </div>
  )
} 