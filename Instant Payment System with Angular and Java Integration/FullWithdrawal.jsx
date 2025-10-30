import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { ArrowDownToLine, Edit, X, RefreshCw, AlertTriangle } from 'lucide-react'

export function FullWithdrawal({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    senderCellNumber: '',
    receiverCellNumber: '',
    withdrawalPin: ''
  })

  const [voucherNumber, setVoucherNumber] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(1000.00) // This would come from API

  // Generate voucher number on component mount
  useEffect(() => {
    generateVoucherNumber()
    fetchCurrentBalance()
  }, [])

  const generateVoucherNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setVoucherNumber(`FW${timestamp}${random}`)
  }

  const fetchCurrentBalance = async () => {
    try {
      // For now, use the static balance. In a real app, this would fetch from API
      setCurrentBalance(1000.00)
      setWithdrawalAmount(1000.00)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProcess = async () => {
    if (!formData.senderCellNumber || !formData.receiverCellNumber || !formData.withdrawalPin) {
      alert('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/transactions/withdraw/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: new URLSearchParams({
          amount: withdrawalAmount.toString()
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Full withdrawal successful! Amount: R${result.amount}`)
        handleCancel() // Reset form
        if (onSuccess) onSuccess() // Refresh parent data
      } else {
        const error = await response.text()
        alert(`Withdrawal failed: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
      console.error('Withdrawal error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = () => {
    // Enable editing mode - for now just focus on first input
    document.getElementById('senderCellNumber')?.focus()
  }

  const handleCancel = () => {
    setFormData({
      senderCellNumber: '',
      receiverCellNumber: '',
      withdrawalPin: ''
    })
    generateVoucherNumber()
  }

  return (
    <div className="space-y-6">
      {/* Header with Voucher Number */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Full Withdrawal</h2>
          <p className="text-gray-600">Withdraw your complete account balance</p>
        </div>
        <div className="text-right">
          <Label className="text-sm text-gray-500">Voucher Number</Label>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg font-mono">
              {voucherNumber}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateVoucherNumber}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Warning:</strong> This will withdraw your entire account balance. 
          This action cannot be undone. Please ensure all details are correct before proceeding.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowDownToLine className="h-5 w-5" />
              <span>Withdrawal Details</span>
            </CardTitle>
            <CardDescription>
              Complete withdrawal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderCellNumber">Sender's Cellphone Number *</Label>
              <Input
                id="senderCellNumber"
                name="senderCellNumber"
                value={formData.senderCellNumber}
                onChange={handleInputChange}
                placeholder="+27 XX XXX XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverCellNumber">Receiver's Cellphone Number *</Label>
              <Input
                id="receiverCellNumber"
                name="receiverCellNumber"
                value={formData.receiverCellNumber}
                onChange={handleInputChange}
                placeholder="+27 XX XXX XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalPin">Withdrawal PIN *</Label>
              <Input
                id="withdrawalPin"
                name="withdrawalPin"
                type="password"
                value={formData.withdrawalPin}
                onChange={handleInputChange}
                placeholder="Enter 4-digit PIN"
                maxLength="4"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Balance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
            <CardDescription>
              Current balance and withdrawal amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Balance:</span>
                <span className="text-lg font-semibold">R{currentBalance.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Withdrawal Amount:</span>
                <span className="text-lg font-semibold text-red-600">R{withdrawalAmount.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining Balance:</span>
                  <span className="text-lg font-semibold">R0.00</span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                After this withdrawal, your account balance will be R0.00. 
                You will need to add funds to perform future transactions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          
          <Button
            onClick={handleProcess}
            disabled={isProcessing || !formData.senderCellNumber || !formData.receiverCellNumber || !formData.withdrawalPin}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Withdraw All'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
