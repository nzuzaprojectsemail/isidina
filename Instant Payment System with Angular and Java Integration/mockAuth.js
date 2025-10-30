// Mock authentication service for demonstration purposes
// This simulates the backend API responses

const MOCK_USERS = [
  {
    id: 1,
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    cellNumber: '0821234567',
    physicalAddress: '123 Main Street, Cape Town, 8001',
    idPassport: '8001015009087',
    balance: 15750.50,
    accountNumber: 'ACC001234567'
  },
  {
    id: 2,
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    cellNumber: '0123456789',
    physicalAddress: 'Test Address',
    idPassport: '1234567890',
    balance: 5000.00,
    accountNumber: 'ACC001234568'
  }
]

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: 'credit',
    amount: 2500.00,
    description: 'Salary Payment',
    date: new Date('2024-10-08T10:30:00'),
    reference: 'TXN001',
    status: 'completed'
  },
  {
    id: 2,
    type: 'debit',
    amount: 150.00,
    description: 'Grocery Store Payment',
    date: new Date('2024-10-07T14:20:00'),
    reference: 'TXN002',
    status: 'completed'
  },
  {
    id: 3,
    type: 'debit',
    amount: 75.50,
    description: 'Coffee Shop',
    date: new Date('2024-10-07T09:15:00'),
    reference: 'TXN003',
    status: 'completed'
  },
  {
    id: 4,
    type: 'credit',
    amount: 1000.00,
    description: 'Freelance Payment',
    date: new Date('2024-10-06T16:45:00'),
    reference: 'TXN004',
    status: 'completed'
  }
]

let currentUser = null
let userTransactions = [...MOCK_TRANSACTIONS]

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAuthService = {
  async login(email, password) {
    await delay(1000) // Simulate network delay
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password)
    
    if (user) {
      currentUser = { ...user }
      delete currentUser.password // Don't expose password
      
      return {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          userId: user.id,
          email: user.email,
          user: currentUser
        }
      }
    }
    
    return {
      success: false,
      error: 'Invalid email or password'
    }
  },

  async register(userData) {
    await delay(1000)
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email)
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      }
    }
    
    // Create new user
    const newUser = {
      id: MOCK_USERS.length + 1,
      ...userData,
      balance: 1000.00, // Starting balance
      accountNumber: 'ACC00123456' + (MOCK_USERS.length + 1)
    }
    
    MOCK_USERS.push(newUser)
    
    return {
      success: true,
      message: 'User registered successfully!'
    }
  },

  async getCurrentUser() {
    await delay(500)
    return currentUser
  },

  async updateProfile(profileData) {
    await delay(1000)
    
    if (currentUser) {
      Object.assign(currentUser, profileData)
      return {
        success: true,
        message: 'Profile updated successfully'
      }
    }
    
    return {
      success: false,
      error: 'User not authenticated'
    }
  },

  async changePassword(currentPassword, newPassword) {
    await delay(1000)
    
    if (currentUser) {
      // In a real app, you'd verify the current password
      return {
        success: true,
        message: 'Password changed successfully'
      }
    }
    
    return {
      success: false,
      error: 'User not authenticated'
    }
  },

  async getTransactions() {
    await delay(800)
    return [...userTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  async sendMoney(recipientEmail, amount, description) {
    await delay(1500)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }
    
    if (currentUser.balance < amount) {
      return {
        success: false,
        error: 'Insufficient funds'
      }
    }
    
    // Create transaction
    const transaction = {
      id: userTransactions.length + 1,
      type: 'debit',
      amount: amount,
      description: `Transfer to ${recipientEmail}: ${description}`,
      date: new Date(),
      reference: 'TXN' + String(userTransactions.length + 1).padStart(3, '0'),
      status: 'completed',
      recipient: recipientEmail
    }
    
    userTransactions.push(transaction)
    currentUser.balance -= amount
    
    return {
      success: true,
      message: 'Money sent successfully',
      transaction
    }
  },

  async withdrawFunds(amount, type = 'partial') {
    await delay(1500)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }
    
    const withdrawAmount = type === 'full' ? currentUser.balance : amount
    
    if (currentUser.balance < withdrawAmount) {
      return {
        success: false,
        error: 'Insufficient funds'
      }
    }
    
    // Create transaction
    const transaction = {
      id: userTransactions.length + 1,
      type: 'debit',
      amount: withdrawAmount,
      description: type === 'full' ? 'Full Account Withdrawal' : 'Partial Withdrawal',
      date: new Date(),
      reference: 'TXN' + String(userTransactions.length + 1).padStart(3, '0'),
      status: 'completed'
    }
    
    userTransactions.push(transaction)
    currentUser.balance -= withdrawAmount
    
    return {
      success: true,
      message: `${type === 'full' ? 'Full' : 'Partial'} withdrawal completed successfully`,
      transaction,
      newBalance: currentUser.balance
    }
  },

  async submitEnquiry(subject, message) {
    await delay(1000)
    
    return {
      success: true,
      message: 'Enquiry submitted successfully. We will respond within 24 hours.',
      enquiryId: 'ENQ' + Date.now()
    }
  },

  logout() {
    currentUser = null
  }
}

// Real-time balance updates simulation
export const createBalanceUpdateStream = (callback) => {
  const interval = setInterval(() => {
    if (currentUser && Math.random() < 0.1) { // 10% chance every 5 seconds
      const randomAmount = Math.random() * 100 + 10 // Random amount between 10-110
      const isCredit = Math.random() > 0.3 // 70% chance of credit
      
      const transaction = {
        id: userTransactions.length + 1,
        type: isCredit ? 'credit' : 'debit',
        amount: randomAmount,
        description: isCredit ? 'Incoming Payment' : 'Automatic Payment',
        date: new Date(),
        reference: 'TXN' + String(userTransactions.length + 1).padStart(3, '0'),
        status: 'completed'
      }
      
      userTransactions.push(transaction)
      
      if (isCredit) {
        currentUser.balance += randomAmount
      } else {
        currentUser.balance = Math.max(0, currentUser.balance - randomAmount)
      }
      
      callback({
        newBalance: currentUser.balance,
        transaction
      })
    }
  }, 5000) // Check every 5 seconds
  
  return () => clearInterval(interval)
}
