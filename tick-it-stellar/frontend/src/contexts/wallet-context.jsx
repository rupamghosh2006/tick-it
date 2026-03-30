'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getAddress, signTransaction } from '@stellar/freighter-api'
import { Networks } from 'stellar-sdk'

const CONTRACT_ID = 'CBPNZIJXF4TTTWRNEYRQTRUINLRTB6VODMFUDVEBHH2BSXHPOAFUHPDH'
const NETWORK_PASSPHRASE = Networks.TESTNET

const WalletContext = createContext(undefined)

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null)
  const [token, setToken] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('stellar_token')
    const savedWallet = localStorage.getItem('stellar_wallet')

    if (savedToken && savedWallet) {
      setToken(savedToken)
      setWalletAddress(savedWallet)
      setIsConnected(true)
    }
  }, [])

  const connect = async () => {
    setIsConnecting(true)

    try {
      const addressResult = await getAddress()

      if (addressResult.error || !addressResult.address) {
        throw new Error(addressResult.error?.message || 'Failed to get wallet address')
      }

      const publicKey = addressResult.address
      console.log('[PUBLIC KEY]', publicKey)

      const challengeRes = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/wallet/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey })
      })

      const challengeData = await challengeRes.json()

      if (!challengeData.success || !challengeData.challengeXDR) {
        throw new Error(challengeData.message || 'Failed to get challenge')
      }

      const challengeXDR = challengeData.challengeXDR

      const signResult = await signTransaction(challengeXDR, {
        networkPassphrase: NETWORK_PASSPHRASE
      })

      if (signResult.error || !signResult.signedTxXdr) {
        throw new Error(signResult.error?.message || 'Failed to sign transaction')
      }

      const signedXDR = signResult.signedTxXdr
      console.log('[SIGNED XDR]', signedXDR)

      const verifyRes = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedXDR, publicKey })
      })

      const verifyData = await verifyRes.json()
      console.log('[AUTH VERIFY RESPONSE]', verifyData)

      if (!verifyData.success || !verifyData.token) {
        throw new Error(verifyData.message || 'Authentication failed')
      }

      setWalletAddress(publicKey)
      setToken(verifyData.token)
      setIsConnected(true)

      localStorage.setItem('stellar_wallet', publicKey)
      localStorage.setItem('stellar_token', verifyData.token)

      return { publicKey, token: verifyData.token }
    } catch (err) {
      console.error('[Wallet Connect] Error:', err)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
    setToken(null)
    setIsConnected(false)
    localStorage.removeItem('stellar_wallet')
    localStorage.removeItem('stellar_token')
    localStorage.removeItem('stellar_user')
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        token,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        contractId: CONTRACT_ID,
        networkPassphrase: NETWORK_PASSPHRASE
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
