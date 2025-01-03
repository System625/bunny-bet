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

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        setAccount(address)
        setProvider(provider)
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    }
  }

  return { account, provider, connectWallet }
} 