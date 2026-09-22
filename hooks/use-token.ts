"use client"
import { useEffect, useState } from "react"

export function useToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem("sothos_token"))
  }, [])

  return token
}