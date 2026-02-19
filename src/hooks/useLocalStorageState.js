import { useEffect, useState } from 'react'

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const value = localStorage.getItem(key)
      if (value !== null) {
        return JSON.parse(value)
      }
    } catch {
      // If parsing fails, fallback to initial value.
    }

    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}
