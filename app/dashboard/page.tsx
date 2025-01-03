"use client"

import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#004d00] bg-opacity-90">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-500">Welcome to BunnyBet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/games/roulette" 
            className="p-6 border-2 border-yellow-500 rounded-lg text-center md:text-left"
          >
            <h2 className="text-2xl font-semibold mb-2 text-yellow-500">Roulette</h2>
            <p className="text-yellow-500">
              Play European and American roulette with crypto
            </p>
          </Link>
          
          {/* Add more game cards here */}
        </div>
      </div>
    </main>
  )
} 