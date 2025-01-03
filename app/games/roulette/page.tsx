import { Navbar } from "@/components/layout/navbar"
import { RouletteGame } from "@/components/games/roulette/roulette-game"

export default function RoulettePage() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Roulette</h1>
        <RouletteGame />
      </div>
    </main>
  )
} 