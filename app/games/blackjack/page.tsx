"use client";

import { BlackjackGame } from "@/components/games/blackjack/blackjack-game";
import { Navbar } from "@/components/layout/navbar";
import { useState } from "react";
import { toast } from "sonner";

export default function BlackjackPage() {
  const [balance, setBalance] = useState(1000); // Start with 1000 tokens

  const handleWin = (amount: number) => {
    setBalance(prev => prev + amount);
    toast.success(`Won ${amount} tokens!`);
  };

  const handleLose = (amount: number) => {
    setBalance(prev => prev - amount);
    toast.error(`Lost ${amount} tokens!`);
  };

  return (
    <main className="min-h-screen bg-[#004d00] bg-opacity-90">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <BlackjackGame
          balance={balance}
          onWin={handleWin}
          onLose={handleLose}
          minBet={1}
          maxBet={500}
        />
      </div>
    </main>
  );
} 