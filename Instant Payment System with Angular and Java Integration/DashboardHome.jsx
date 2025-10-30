import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNotifications } from '../../contexts/NotificationContext'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Send, 
  ArrowDownToLine,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function DashboardHome({ userBalance, onBalanceUpdate }) {
  const [recentTransactions, setRecentTransactions] = useState([])
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    totalTransactions: 0
  })
  const [currentBalance, setCurrentBalance] = useState(userBalance || 0)
  const navigate = useNavigate()
  const { addNotification, startBalanceUpdates } = useNotifications()

  useEffect(() => {
    setCurrentBalance(userBalance || 0)
  }, [userBalance])

  useEffect(() => {
    // Load initial transactions from mock service
    const loadTransactions = async () => {
      try {
        const { mockAuthService } = await import('../../services/mockAuth.js')
        const transactions = await mockAuthService.getTransactions()
        setRecentTransactions(transactions.slice(0, 5)) // Show only recent 5
        
        // Calculate stats
        const totalSent = transactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0)
        const totalReceived = transactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0)
        
        setStats({
          totalSent,
          totalReceived,
          totalTransactions: transactions.length
        })
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    }

    loadTransactions()

    // Start real-time balance updates
    const initializeUpdates = async () => {
      try {
        const stopUpdates = await startBalanceUpdates((update) => {
          setCurrentBalance(update.newBalance)
          
          // Update recent transactions
          setRecentTransactions(prev => [update.transaction, ...prev.slice(0, 4)])
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalSent: update.transaction.type === 'debit' 
              ? prev.totalSent + update.transaction.amount 
              : prev.totalSent,
            totalReceived: update.transaction.type === 'credit' 
              ? prev.totalReceived + update.transaction.amount 
              : prev.totalReceived,
            totalTransactions: prev.totalTransactions + 1
          }))

          // Call parent callback if provided
          if (onBalanceUpdate) {
            onBalanceUpdate(update.newBalance)
          }
        })
        
        return stopUpdates
      } catch (error) {
        console.error('Error initializing balance updates:', error)
        return null
      }
    }

    let cleanup = null
    initializeUpdates().then(stopFn => {
      cleanup = stopFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [startBalanceUpdates, onBalanceUpdate])

  const quickActions = [
    {
      title: 'Send Money',
      description: 'Transfer money to another user',
      icon: Send,
      color: 'bg-blue-500',
      path: '/dashboard/send-money'
    },
    {
      title: 'Full Withdrawal',
      description: 'Withdraw all available funds',
      icon: ArrowDownToLine,
      color: 'bg-green-500',
      path: '/dashboard/full-withdrawal'
    },
    {
      title: 'Partial Withdrawal',
      description: 'Withdraw a specific amount',
      icon: TrendingDown,
      color: 'bg-orange-500',
      path: '/dashboard/partial-withdrawal'
    }
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to InstantPay</CardTitle>
            <CardDescription className="text-blue-100">
              Manage your finances with ease and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Available Balance</p>
                <motion.p 
                  key={currentBalance}
                  initial={{ scale: 1.1, color: "#10b981" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold"
                >
                  R{currentBalance.toFixed(2)}
                </motion.p>
              </div>
              <DollarSign className="h-16 w-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R{stats.totalSent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Money sent to others
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R{stats.totalReceived.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Money received from others
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                All time transactions
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Perform common tasks with one click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => navigate(action.path)}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 w-full"
                    >
                      <div className={`p-3 rounded-full ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Start by sending money or making a withdrawal</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {transaction.type === 'sent' ? (
                          <Send className="h-4 w-4 text-red-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                          {transaction.recipient || transaction.sender}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'sent' ? '-' : '+'}R{transaction.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
