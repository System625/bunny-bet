'use client'

import { useEffect, useRef } from 'react'

interface RouletteWheelProps {
  spinning: boolean
  number: number | null
  onSpinComplete?: (number: number) => void
}

export function RouletteWheel({ spinning, number, onSpinComplete }: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const rotationRef = useRef(0)
  const ballRef = useRef({ angle: 0, radius: 0, speed: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const numbers = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
      11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
      22, 18, 29, 7, 28, 12, 35, 3, 26
    ]

    const drawWheel = (rotation: number, ballAngle: number, ballRadius: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) - 20

      // Draw outer ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2)
      ctx.fillStyle = '#FFD700'
      ctx.fill()
      ctx.stroke()

      // Draw segments
      numbers.forEach((num, i) => {
        const angle = (i * 2 * Math.PI) / numbers.length
        const nextAngle = ((i + 1) * 2 * Math.PI) / numbers.length

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(rotation)

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, angle, nextAngle)
        ctx.closePath()

        ctx.fillStyle = num === 0 ? '#008000' : i % 2 ? '#FF0000' : '#000000'
        ctx.fill()
        ctx.stroke()

        // Add numbers
        ctx.save()
        ctx.rotate(angle + (nextAngle - angle) / 2)
        ctx.translate(radius * 0.75, 0)
        ctx.rotate(Math.PI / 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(num.toString(), 0, 0)
        ctx.restore()

        ctx.restore()
      })

      // Draw center circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
      ctx.fillStyle = '#FFD700'
      ctx.fill()
      ctx.stroke()

      // Draw ball
      const ballX = centerX + Math.cos(ballAngle) * ballRadius
      const ballY = centerY + Math.sin(ballAngle) * ballRadius
      ctx.beginPath()
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.stroke()
    }

    let wheelSpeed = spinning ? 0.2 : 0
    let wheelDeceleration = 0.001
    
    // Ball physics
    if (spinning && ballRef.current.speed === 0) {
      ballRef.current.radius = Math.min(canvas.width, canvas.height) / 2 - 25
      ballRef.current.speed = -0.5 // Start spinning opposite to wheel
    }

    const animate = () => {
      rotationRef.current += wheelSpeed
      
      // Update ball
      if (spinning) {
        ballRef.current.angle += ballRef.current.speed
        if (wheelSpeed < 0.05) {
          // Ball starts falling
          ballRef.current.radius = Math.max(
            Math.min(canvas.width, canvas.height) / 2 - 80,
            ballRef.current.radius - 0.5
          )
          ballRef.current.speed = Math.min(0, ballRef.current.speed + 0.02)
        }
      }

      drawWheel(
        rotationRef.current,
        ballRef.current.angle,
        ballRef.current.radius
      )

      if (spinning) {
        wheelSpeed = Math.max(0, wheelSpeed - wheelDeceleration)
        if (wheelSpeed === 0 && ballRef.current.radius === Math.min(canvas.width, canvas.height) / 2 - 80) {
          // Spin complete - calculate winning number
          const normalizedAngle = ((ballRef.current.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
          const segmentAngle = (Math.PI * 2) / numbers.length
          const numberIndex = numbers.length - 1 - Math.floor(normalizedAngle / segmentAngle)
          const result = numbers[numberIndex >= 0 && numberIndex < numbers.length ? numberIndex : 0]

          if (typeof result === 'number' && result >= 0 && result <= 36) {
            onSpinComplete?.(result)
          } else {
            console.error('Invalid roulette result:', result, 'Index:', numberIndex, 'Angle:', normalizedAngle)
            onSpinComplete?.(0)
          }
        } else {
          animationRef.current = requestAnimationFrame(animate)
        }
      }
    }

    if (spinning) {
      wheelSpeed = 0.2
      animationRef.current = requestAnimationFrame(animate)
    } else {
      drawWheel(rotationRef.current, ballRef.current.angle, ballRef.current.radius)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [spinning, number, onSpinComplete])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="border rounded-full w-full max-w-[400px] h-auto"
    />
  )
} 