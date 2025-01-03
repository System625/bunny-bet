"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'
import { useState } from "react"

export function Navbar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    // Remove the auth cookie
    Cookies.remove('auth')
    // Redirect to login page
    router.push('/')
  }

  return (
    <nav className="border-b border-yellow-500/20">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center">
          <h1 className="text-xl font-bold text-yellow-500">BunnyBet</h1>
        </Link>
        
        {/* Desktop Menu */}
        <div className="ml-auto hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-yellow-500 hover:text-yellow-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="ml-auto md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-yellow-500"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-yellow-500/20 bg-black bg-opacity-50">
          <div className="px-4 py-3 space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="w-full text-yellow-500 hover:text-yellow-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
} 