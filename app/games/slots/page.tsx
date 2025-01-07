"use client";

import { Navbar } from "@/components/layout/navbar";
import { SlotsGame } from "@/components/games/slots/slots-game";

export default function SlotsPage() {
  return (
    <main className="min-h-screen bg-[#004d00] bg-opacity-90">
      <Navbar />
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-500">
          Slots
        </h1>
        <SlotsGame />
      </div>
    </main>
  );
} 