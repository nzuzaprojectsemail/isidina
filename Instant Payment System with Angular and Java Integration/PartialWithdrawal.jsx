import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { ArrowUpFromLine, Edit, X, RefreshCw, User } from 'lucide-react'

export function PartialWithdrawal({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    senderCellNumber: '',
    receiverCellNumber: '',
    withdrawalPin: '',
    withdrawalAmount: '',
    newWithdrawalPin: '',
    receiverName: '',
    receiverSurname: '',
    receiverIdPassport: '',
    receiverAddress: ''
  })

  const [voucherNumber, setVoucherNumber] = useState('')
  const [calculatedAmounts, setCalculatedAmounts] = useState({
    withdrawalAmount: 0,
    creditBalanceAmount: 0
  })
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
    setVoucherNumber(`PW${timestamp}${random}`)
  }

  const fetchCurrentBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const response = await fetch(`http://localhost:8080/api/users/${userId}/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  const calculateAmounts = (amount) => {
    const withdrawalAmount = parseFloat(amount) || 0
    const creditBalanceAmount = currentBalance - withdrawalAmount

    setCalculatedAmounts({
      withdrawalAmount,
      creditBalanceAmount: Math.max(0, creditBalanceAmount)
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'withdrawalAmount') {
      calculateAmounts(value)
    }
  }

  const handleProcess = async () => {
    if (!formData.senderCellNumber || !formData.receiverCellNumber || !formData.withdrawalPin || !formData.withdrawalAmount) {
      alert('Please fill in all required fields.')
      return
    }

    if (parseFloat(formData.withdrawalAmount) > currentBalance) {
      alert('Withdrawal amount cannot exceed current balance.')
      return
    }

    if (parseFloat(formData.withdrawalAmount) <= 0) {
      alert('Withdrawal amount must be greater than zero.')
      return
    }

    setIsProcessing(true)
    
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      const response = await fetch('http://localhost:8080/api/transactions/withdraw/partial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderUserId: userId,
          senderCellNumber: formData.senderCellNumber,
          receiverCellNumber: formData.receiverCellNumber,
          withdrawalPin: formData.withdrawalPin,
          amount: parseFloat(formData.withdrawalAmount),
          newWithdrawalPin: formData.newWithdrawalPin,
          receiverName: formData.receiverName,
          receiverSurname: formData.receiverSurname,
          receiverIdPassport: formData.receiverIdPassport,
          receiverAddress: formData.receiverAddress,
          voucherNumber
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Partial withdrawal successful! Voucher: ${result.voucherNumber}\nAmount withdrawn: R${result.withdrawalAmount}\nRemaining balance: R${result.creditBalanceAmount}`)
        handleCancel() // Reset form
        fetchCurrentBalance() // Refresh balance
        if (onSuccess) onSuccess() // Refresh parent data
      } else {
        const error = await response.text()
        alert(`Withdrawal failed: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = () => {
    // Enable editing mode - focus on first input
    document.getElementById('senderCellNumber')?.focus()
  }

  const handleCancel = () => {
    setFormData({
      senderCellNumber: '',
      receiverCellNumber: '',
      withdrawalPin: '',
      withdrawalAmount: '',
      newWithdrawalPin: '',
      receiverName: '',
      receiverSurname: '',
      receiverIdPassport: '',
      receiverAddress: ''
    })
    setCalculatedAmounts({
      withdrawalAmount: 0,
      creditBalanceAmount: 0
    })
    generateVoucherNumber()
  }

  return (
    <div className="space-y-6">
      {/* Header with Voucher Number */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partial Withdrawal</h2>
          <p className="text-gray-600">Withdraw a specific amount from your account</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowUpFromLine className="h-5 w-5" />
              <span>Withdrawal Details</span>
            </CardTitle>
            <CardDescription>
              Enter withdrawal information
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
              <Label htmlFor="withdrawalPin">Current Withdrawal PIN *</Label>
              <Input
                id="withdrawalPin"
                name="withdrawalPin"
                type="password"
                value={formData.withdrawalPin}
                onChange={handleInputChange}
                placeholder="Enter current 4-digit PIN"
                maxLength="4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalAmount">Withdrawal Amount (R) *</Label>
              <Input
                id="withdrawalAmount"
                name="withdrawalAmount"
                type="number"
                step="0.01"
                min="0"
                max={currentBalance}
                value={formData.withdrawalAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500">
                Maximum available: R{currentBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newWithdrawalPin">New Withdrawal PIN (Optional)</Label>
              <Input
                id="newWithdrawalPin"
                name="newWithdrawalPin"
                type="password"
                value={formData.newWithdrawalPin}
                onChange={handleInputChange}
                placeholder="Enter new 4-digit PIN"
                maxLength="4"
              />
              <p className="text-xs text-gray-500">
                Leave blank to keep current PIN
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Receiver Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Receiver Information</span>
            </CardTitle>
            <CardDescription>
              Enter receiver's details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver's Name *</Label>
                <Input
                  id="receiverName"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverSurname">Receiver's Surname *</Label>
                <Input
                  id="receiverSurname"
                  name="receiverSurname"
                  value={formData.receiverSurname}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverIdPassport">Receiver's ID/Passport *</Label>
              <Input
                id="receiverIdPassport"
                name="receiverIdPassport"
                value={formData.receiverIdPassport}
                onChange={handleInputChange}
                placeholder="ID or Passport number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverAddress">Receiver's Address *</Label>
              <Input
                id="receiverAddress"
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={handleInputChange}
                placeholder="Complete physical address"
                required
              />
            </div>

            <Separator />

            {/* Amount Summary */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Amount Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span>R{currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span className="font-medium text-red-600">R{calculatedAmounts.withdrawalAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Credit Balance Amount:</span>
                  <span className="text-green-600">R{calculatedAmounts.creditBalanceAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
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
          disabled={isProcessing || !formData.withdrawalAmount || !formData.senderCellNumber || !formData.receiverCellNumber}
          className="flex items-center space-x-2"
        >
          {isProcessing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4" />
          )}
          <span>{isProcessing ? 'Processing...' : 'Process Withdrawal'}</span>
        </Button>
        </div>
      </div>
    </div>
  )
}
