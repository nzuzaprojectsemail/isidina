import { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [balanceUpdateStream, setBalanceUpdateStream] = useState(null)

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]) // Keep only 5 notifications
    
    // Auto-remove after 5 seconds unless it's persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const startBalanceUpdates = async (onBalanceUpdate) => {
    if (balanceUpdateStream) {
      balanceUpdateStream() // Stop existing stream
    }

    const { createBalanceUpdateStream } = await import('../services/mockAuth.js')
    const stopStream = createBalanceUpdateStream((update) => {
      // Add notification for balance update
      addNotification({
        type: 'balance',
        title: update.transaction.type === 'credit' ? 'Money Received' : 'Payment Made',
        message: `${update.transaction.type === 'credit' ? '+' : '-'}R${update.transaction.amount.toFixed(2)}`,
        description: update.transaction.description,
        newBalance: update.newBalance,
        transaction: update.transaction
      })
      
      // Call the callback to update the UI
      if (onBalanceUpdate) {
        onBalanceUpdate(update)
      }
    })
    
    setBalanceUpdateStream(() => stopStream)
    return stopStream
  }

  const stopBalanceUpdates = () => {
    if (balanceUpdateStream) {
      balanceUpdateStream()
      setBalanceUpdateStream(null)
    }
  }

  useEffect(() => {
    return () => {
      stopBalanceUpdates()
    }
  }, [])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    startBalanceUpdates,
    stopBalanceUpdates
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

const NotificationCard = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'balance':
        return notification.transaction?.type === 'credit' 
          ? <TrendingUp className="h-5 w-5 text-green-500" />
          : <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200'
      case 'error':
        return 'border-red-200'
      case 'info':
        return 'border-blue-200'
      case 'balance':
        return notification.transaction?.type === 'credit' 
          ? 'border-green-200' 
          : 'border-orange-200'
      default:
        return 'border-gray-200'
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50'
      case 'error':
        return 'bg-red-50'
      case 'info':
        return 'bg-blue-50'
      case 'balance':
        return notification.transaction?.type === 'credit' 
          ? 'bg-green-50' 
          : 'bg-orange-50'
      default:
        return 'bg-white'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        relative p-4 rounded-lg shadow-lg border-2 backdrop-blur-sm
        ${getBorderColor()} ${getBackgroundColor()}
        max-w-sm w-full
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </h4>
            <button
              onClick={onRemove}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-700 mt-1">
            {notification.message}
          </p>
          
          {notification.description && (
            <p className="text-xs text-gray-500 mt-1">
              {notification.description}
            </p>
          )}
          
          {notification.newBalance !== undefined && (
            <div className="mt-2 text-xs text-gray-600">
              New Balance: <span className="font-semibold text-green-600">
                R{notification.newBalance.toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="text-xs text-gray-400 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {!notification.persistent && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
        >
          <div className="h-full bg-blue-500" />
        </motion.div>
      )}
    </motion.div>
  )
}
