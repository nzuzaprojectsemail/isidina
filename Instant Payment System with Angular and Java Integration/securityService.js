// Security service for enhanced authentication and authorization
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

class SecurityService {
  constructor() {
    this.loginAttempts = new Map()
    this.sessionTimer = null
    this.initializeSessionMonitoring()
  }

  // Simple encryption using base64 (for demo purposes)
  encrypt(data) {
    try {
      return btoa(JSON.stringify(data))
    } catch (error) {
      console.error('Encryption error:', error)
      return null
    }
  }

  // Simple decryption using base64 (for demo purposes)
  decrypt(encryptedData) {
    try {
      return JSON.parse(atob(encryptedData))
    } catch (error) {
      console.error('Decryption error:', error)
      return null
    }
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const score = [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    ].filter(Boolean).length

    return {
      isValid: score >= 4,
      score,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      },
      strength: score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong'
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate South African ID number
  validateSAIdNumber(idNumber) {
    if (!/^\d{13}$/.test(idNumber)) return false

    const digits = idNumber.split('').map(Number)
    let sum = 0

    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) {
        sum += digits[i]
      } else {
        const doubled = digits[i] * 2
        sum += doubled > 9 ? doubled - 9 : doubled
      }
    }

    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[12]
  }

  // Validate South African phone number
  validateSAPhoneNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\s+/g, '')
    const saPhoneRegex = /^(\+27|0)[6-8][0-9]{8}$/
    return saPhoneRegex.test(cleanNumber)
  }

  // Check for suspicious activity patterns
  detectSuspiciousActivity(userActivity) {
    const suspiciousPatterns = []

    // Multiple failed login attempts
    if (userActivity.failedLogins > 3) {
      suspiciousPatterns.push('multiple_failed_logins')
    }

    // Rapid successive transactions
    if (userActivity.transactionsInLastHour > 10) {
      suspiciousPatterns.push('rapid_transactions')
    }

    // Large transaction amounts
    if (userActivity.largeTransactionAmount > 10000) {
      suspiciousPatterns.push('large_transaction')
    }

    // Unusual login times
    const currentHour = new Date().getHours()
    if (currentHour < 6 || currentHour > 23) {
      suspiciousPatterns.push('unusual_login_time')
    }

    return {
      isSuspicious: suspiciousPatterns.length > 0,
      patterns: suspiciousPatterns,
      riskLevel: suspiciousPatterns.length === 0 ? 'low' : 
                 suspiciousPatterns.length <= 2 ? 'medium' : 'high'
    }
  }

  // Rate limiting for login attempts
  checkLoginAttempts(email) {
    const now = Date.now()
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0, lockedUntil: 0 }

    // Check if account is locked
    if (attempts.lockedUntil > now) {
      const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60)
      return {
        allowed: false,
        reason: 'account_locked',
        remainingTime
      }
    }

    // Reset attempts if enough time has passed
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      attempts.count = 0
    }

    return {
      allowed: attempts.count < MAX_LOGIN_ATTEMPTS,
      attemptsRemaining: MAX_LOGIN_ATTEMPTS - attempts.count
    }
  }

  // Record login attempt
  recordLoginAttempt(email, success) {
    const now = Date.now()
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0, lockedUntil: 0 }

    if (success) {
      // Reset on successful login
      this.loginAttempts.delete(email)
    } else {
      attempts.count++
      attempts.lastAttempt = now

      // Lock account if max attempts reached
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_DURATION
      }

      this.loginAttempts.set(email, attempts)
    }
  }

  // Generate secure session token
  generateSessionToken() {
    const timestamp = Date.now()
    const randomBytes = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const sessionData = {
      timestamp,
      random: randomBytes,
      expires: timestamp + SESSION_TIMEOUT
    }
    return this.encrypt(sessionData)
  }

  // Validate session token
  validateSessionToken(token) {
    try {
      const sessionData = this.decrypt(token)
      if (!sessionData) return false

      const now = Date.now()
      return sessionData.expires > now
    } catch (error) {
      return false
    }
  }

  // Initialize session monitoring
  initializeSessionMonitoring() {
    // Check session validity every minute
    this.sessionTimer = setInterval(() => {
      const token = localStorage.getItem('token')
      if (token && !this.validateSessionToken(token)) {
        this.handleSessionExpiry()
      }
    }, 60000)

    // Monitor user activity
    this.setupActivityMonitoring()
  }

  // Setup activity monitoring
  setupActivityMonitoring() {
    let lastActivity = Date.now()

    const updateActivity = () => {
      lastActivity = Date.now()
    }

    // Monitor user interactions
    document.addEventListener('mousedown', updateActivity)
    document.addEventListener('keydown', updateActivity)
    document.addEventListener('scroll', updateActivity)
    document.addEventListener('touchstart', updateActivity)

    // Check for inactivity
    setInterval(() => {
      const inactiveTime = Date.now() - lastActivity
      if (inactiveTime > SESSION_TIMEOUT) {
        this.handleSessionExpiry()
      }
    }, 60000)
  }

  // Handle session expiry
  handleSessionExpiry() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Dispatch custom event for session expiry
    window.dispatchEvent(new CustomEvent('sessionExpired', {
      detail: { reason: 'timeout' }
    }))
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  // Generate CSRF token
  generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Validate transaction amount
  validateTransactionAmount(amount, userBalance) {
    const numAmount = parseFloat(amount)
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Invalid amount' }
    }

    if (numAmount > userBalance) {
      return { valid: false, error: 'Insufficient funds' }
    }

    if (numAmount > 50000) {
      return { valid: false, error: 'Amount exceeds daily limit' }
    }

    return { valid: true }
  }

  // Log security events
  logSecurityEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // In real app, get from server
    }

    // In production, send to security monitoring service
    console.log('Security Event:', logEntry)
    
    // Store locally for demo purposes
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
    logs.push(logEntry)
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }
    
    localStorage.setItem('securityLogs', JSON.stringify(logs))
  }

  // Get security logs
  getSecurityLogs() {
    return JSON.parse(localStorage.getItem('securityLogs') || '[]')
  }

  // Cleanup on logout
  cleanup() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }
    this.loginAttempts.clear()
  }
}

// Create singleton instance
const securityService = new SecurityService()

export default securityService

// Export individual functions for convenience
export const {
  encrypt,
  decrypt,
  validatePasswordStrength,
  validateEmail,
  validateSAIdNumber,
  validateSAPhoneNumber,
  detectSuspiciousActivity,
  checkLoginAttempts,
  recordLoginAttempt,
  generateSessionToken,
  validateSessionToken,
  sanitizeInput,
  generateCSRFToken,
  validateTransactionAmount,
  logSecurityEvent,
  getSecurityLogs
} = securityService
