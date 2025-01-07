import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Add this type declaration at the top of the file
declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [balance, setBalance] = useState<string>('0')
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  const connectWallet = async () => {
    if (!isClient) return
    if (typeof window?.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        // Get and set initial balance
        const balance = await provider.getBalance(address)
        setBalance(ethers.formatEther(balance))
        
        setAccount(address)
        setProvider(provider)
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    }
  }

  const placeBet = async (amount: number) => {
    if (!account || !provider) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = await provider.getSigner()
      const tx = {
        to: process.env.NEXT_PUBLIC_CASINO_ADDRESS,
        value: ethers.parseEther(amount.toString())
      }
      
      const transaction = await signer.sendTransaction(tx)
      await transaction.wait()

      // Update balance after bet
      const newBalance = await provider.getBalance(account)
      setBalance(ethers.formatEther(newBalance))

      return transaction
    } catch (error) {
      console.error('Error placing bet:', error)
      throw error
    }
  }

  // Update balance when account changes
  useEffect(() => {
    if (account && provider) {
      provider.getBalance(account).then((balance: bigint) => {
        setBalance(ethers.formatEther(balance))
      })
    }
  }, [account, provider])

  return { account, provider, balance, connectWallet, placeBet }
} 