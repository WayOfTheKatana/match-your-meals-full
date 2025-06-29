import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, action, variant, duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, action, variant, duration }
    
    setToasts((prevToasts) => [...prevToasts, newToast])

    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismiss = useCallback((toastId) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}