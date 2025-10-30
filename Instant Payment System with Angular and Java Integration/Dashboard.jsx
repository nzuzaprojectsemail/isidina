import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Home, 
  Send, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  MessageSquare, 
  Settings, 
  LogOut,
  User,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '../contexts/AuthContext'

// Import dashboard components
import DashboardHome from './dashboard/DashboardHome'
import SendMoney from './dashboard/SendMoney'
import FullWithdrawal from './dashboard/FullWithdrawal'
import PartialWithdrawal from './dashboard/PartialWithdrawal'
import Enquiries from './dashboard/Enquiries'
import Maintenance from './dashboard/Maintenance'

const navigationItems = [
  { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'send', label: 'Send Money', icon: Send, path: '/dashboard/send-money' },
  { id: 'full-withdrawal', label: 'Full Withdrawal', icon: ArrowDownToLine, path: '/dashboard/full-withdrawal' },
  { id: 'partial-withdrawal', label: 'Partial Withdrawal', icon: ArrowUpFromLine, path: '/dashboard/partial-withdrawal' },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, path: '/dashboard/enquiries' },
  { id: 'maintenance', label: 'Maintenance', icon: Settings, path: '/dashboard/maintenance' },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userBalance, setUserBalance] = useState(1000.00) // Default R1000 balance
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname)
    return currentItem ? currentItem.label : 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">InstantPay</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                    <p className="text-sm text-gray-600">Balance: R{userBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </motion.button>
                  )
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {getCurrentPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-lg font-bold text-green-600">R{userBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={<DashboardHome userBalance={userBalance} />} />
              <Route path="/send-money" element={<SendMoney userBalance={userBalance} setUserBalance={setUserBalance} />} />
              <Route path="/full-withdrawal" element={<FullWithdrawal userBalance={userBalance} setUserBalance={setUserBalance} />} />
              <Route path="/partial-withdrawal" element={<PartialWithdrawal userBalance={userBalance} setUserBalance={setUserBalance} />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/maintenance" element={<Maintenance />} />
            </Routes>
          </motion.div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
