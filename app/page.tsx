"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Cookies from 'js-cookie'

export default function AuthPage() {
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    // For static auth, we'll use hardcoded credentials
    if (user === "demo" && password === "demo123") {
      // Set auth cookie
      Cookies.set('auth', 'authenticated', { expires: 7 }) // Expires in 7 days
      router.push("/dashboard")
    } else {
      alert("Invalid credentials! Use demo/demo123")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#004d00] bg-opacity-90 px-2 md:px-0">
      <div className="w-full max-w-md p-8 space-y-6 border-double border-4 border-yellow-500 rounded-lg bg-black bg-opacity-50">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src="/bunny-logo.png"
            alt="BunnyBet Logo"
            width={80}
            height={80}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-yellow-500">BUNNYBET</h1>
          <p className="text-yellow-500">Dare catch the rabbit</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-yellow-500">User</label>
                <Input
                  type="text"
                  placeholder="User"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="bg-transparent border-yellow-500 text-yellow-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-yellow-500">Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-yellow-500 text-yellow-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
              >
                Sign in
              </Button>

              <Button
                variant="link"
                className="w-full text-yellow-500"
              >
                I forgot password
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-yellow-500">User</label>
                <Input
                  type="text"
                  placeholder="User"
                  className="bg-transparent border-yellow-500 text-yellow-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-yellow-500">Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-transparent border-yellow-500 text-yellow-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-yellow-500">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className="bg-transparent border-yellow-500 text-yellow-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
              >
                Sign up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
