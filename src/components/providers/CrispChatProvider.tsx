"use client"

import { useEffect } from "react"

// Replace with your actual Crisp Website ID
const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || ""

export function CrispChatProvider() {
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) {
      console.log("Crisp chat not configured. Set NEXT_PUBLIC_CRISP_WEBSITE_ID to enable live chat.")
      return
    }

    // Initialize Crisp
    window.$crisp = []
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID

    // Load Crisp script
    const script = document.createElement("script")
    script.src = "https://client.crisp.chat/l.js"
    script.async = true
    document.head.appendChild(script)

    // Configure Crisp settings
    window.$crisp.push(["set", "locale", "en"])
    window.$crisp.push(["set", "chat_visible", false])
    window.$crisp.push(["set", "躲避模式", false])

    return () => {
      // Cleanup script on unmount
      const crispScript = document.querySelector('script[src*="client.crisp.chat"]')
      if (crispScript) {
        crispScript.remove()
      }
    }
  }, [])

  return null
}

// Type declarations for Crisp
declare global {
  interface Window {
    $crisp: any[]
    CRISP_WEBSITE_ID: string
    CRISP_TOKEN?: string
  }
}