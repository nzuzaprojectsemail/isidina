import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Send, Edit, X, RefreshCw } from 'lucide-react'

export function SendMoney({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    senderName: '',
    senderSurname: '',
    senderIdPassport: '',
    senderPhysicalAddress: '',
    senderCellNumber: '',
    receiverEmail: '',
    sendAmount: '',
    withdrawalPin: '',
    pinType: 'system' // 'system' or 'manual'
  })

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    commissionAmount: 0,
    vatAmount: 0,
    totalAmount: 0
  })

  const [voucherNumber, setVoucherNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Generate voucher number on component mount
  useState(() => {
    generateVoucherNumber()
  }, [])

  const generateVoucherNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setVoucherNumber(`VP${timestamp}${random}`)
  }

  const generateSystemPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    setFormData(prev => ({ ...prev, withdrawalPin: pin }))
  }

  const calculateAmounts = (amount) => {
    const sendAmount = parseFloat(amount) || 0
    const commissionRate = 0.05 // 5% commission
    const vatRate = 0.15 // 15% VAT on commission
    
    const commission = sendAmount * commissionRate
    const vat = commission * vatRate
    const total = sendAmount + commission + vat

    setCalculatedAmounts({
      commissionAmount: commission,
      vatAmount: vat,
      totalAmount: total
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'sendAmount') {
      calculateAmounts(value)
    }
  }

  const handlePinTypeChange = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      pinType: value,
      withdrawalPin: value === 'system' ? '' : prev.withdrawalPin
    }))
    
    if (value === 'system') {
      generateSystemPin()
    }
  }

  const handleProcess = async () => {
    if (!formData.sendAmount || !formData.receiverEmail) {
      alert('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/transactions/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: new URLSearchParams({
          receiverUsername: formData.receiverEmail,
          amount: formData.sendAmount
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Transaction successful! Amount: R${result.amount}, Commission: R${result.commission}, VAT: R${result.vat}`)
        handleCancel() // Reset form
        if (onSuccess) onSuccess() // Refresh parent data
      } else {
        const error = await response.text()
        alert(`Transaction failed: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
      console.error('Transaction error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = () => {
    // Enable editing mode - for now just focus on first input
    document.getElementById('senderName')?.focus()
  }

  const handleCancel = () => {
    setFormData({
      senderName: '',
      senderSurname: '',
      senderIdPassport: '',
      senderPhysicalAddress: '',
      senderCellNumber: '',
      receiverEmail: '',
      sendAmount: '',
      withdrawalPin: '',
      pinType: 'system'
    })
    setCalculatedAmounts({
      commissionAmount: 0,
      vatAmount: 0,
      totalAmount: 0
    })
    generateVoucherNumber()
  }

  return (
    <div className="space-y-6">
      {/* Header with Voucher Number */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Send Money</h2>
          <p className="text-gray-600">Transfer funds to another user</p>
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
        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Sender Information</span>
            </CardTitle>
            <CardDescription>
              Enter the sender's details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender's Name *</Label>
                <Input
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderSurname">Sender's Surname *</Label>
                <Input
                  id="senderSurname"
                  name="senderSurname"
                  value={formData.senderSurname}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderIdPassport">Sender's ID/Passport *</Label>
              <Input
                id="senderIdPassport"
                name="senderIdPassport"
                value={formData.senderIdPassport}
                onChange={handleInputChange}
                placeholder="ID or Passport number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderPhysicalAddress">Sender's Physical Address *</Label>
              <Input
                id="senderPhysicalAddress"
                name="senderPhysicalAddress"
                value={formData.senderPhysicalAddress}
                onChange={handleInputChange}
                placeholder="Complete physical address"
                required
              />
            </div>

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
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Enter transaction information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiverEmail">Receiver's Email Address *</Label>
              <Input
                id="receiverEmail"
                name="receiverEmail"
                type="email"
                value={formData.receiverEmail}
                onChange={handleInputChange}
                placeholder="receiver@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sendAmount">Send Amount (R) *</Label>
              <Input
                id="sendAmount"
                name="sendAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.sendAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Amount Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Send Amount:</span>
                  <span>R{parseFloat(formData.sendAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission (5%):</span>
                  <span>R{calculatedAmounts.commissionAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%):</span>
                  <span>R{calculatedAmounts.vatAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>R{calculatedAmounts.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* PIN Configuration */}
            <div className="space-y-3">
              <Label>Withdrawal PIN Configuration</Label>
              <RadioGroup
                value={formData.pinType}
                onValueChange={handlePinTypeChange}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system-pin" />
                  <Label htmlFor="system-pin">System Generated PIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual-pin" />
                  <Label htmlFor="manual-pin">Manual PIN</Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="withdrawalPin">
                  {formData.pinType === 'system' ? 'Generated PIN' : 'Enter PIN'}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="withdrawalPin"
                    name="withdrawalPin"
                    type="text"
                    value={formData.withdrawalPin}
                    onChange={handleInputChange}
                    placeholder={formData.pinType === 'system' ? 'Auto-generated' : 'Enter 4-digit PIN'}
                    readOnly={formData.pinType === 'system'}
                    maxLength="4"
                    required
                  />
                  {formData.pinType === 'system' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSystemPin}
                      className="px-3"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
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
            disabled={isProcessing || !formData.sendAmount || !formData.receiverEmail}
            className="flex items-center space-x-2"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Process'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
