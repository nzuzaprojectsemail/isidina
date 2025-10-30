import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Eye, EyeOff } from 'lucide-react'
import securityService from '../services/securityService'

export default function PasswordStrengthIndicator({ password, onValidityChange }) {
  const [strength, setStrength] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (password) {
      const strengthResult = securityService.validatePasswordStrength(password)
      setStrength(strengthResult)
      
      if (onValidityChange) {
        onValidityChange(strengthResult.isValid)
      }
    } else {
      setStrength(null)
      if (onValidityChange) {
        onValidityChange(false)
      }
    }
  }, [password, onValidityChange])

  if (!password || !strength) return null

  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getStrengthText = () => {
    switch (strength.strength) {
      case 'weak': return 'Weak'
      case 'medium': return 'Medium'
      case 'strong': return 'Strong'
      default: return 'Very Weak'
    }
  }

  const requirements = [
    { key: 'minLength', text: 'At least 8 characters', met: strength.requirements.minLength },
    { key: 'hasUpperCase', text: 'One uppercase letter', met: strength.requirements.hasUpperCase },
    { key: 'hasLowerCase', text: 'One lowercase letter', met: strength.requirements.hasLowerCase },
    { key: 'hasNumbers', text: 'One number', met: strength.requirements.hasNumbers },
    { key: 'hasSpecialChar', text: 'One special character', met: strength.requirements.hasSpecialChar }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2 p-3 bg-gray-50 rounded-lg border"
    >
      {/* Strength Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-semibold ${
            strength.strength === 'weak' ? 'text-red-600' :
            strength.strength === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
            className={`h-2 rounded-full ${getStrengthColor()}`}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 mb-2">Requirements:</p>
        {requirements.map((req) => (
          <motion.div
            key={req.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
              req.met ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {req.met ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <span className={`text-xs ${
              req.met ? 'text-green-700' : 'text-gray-500'
            }`}>
              {req.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Security Tips */}
      {strength.strength === 'weak' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700"
        >
          <strong>Security Tip:</strong> Use a mix of uppercase, lowercase, numbers, and special characters for better security.
        </motion.div>
      )}
    </motion.div>
  )
}

export function PasswordInput({ 
  value, 
  onChange, 
  placeholder = "Enter password",
  showStrengthIndicator = false,
  onValidityChange,
  className = "",
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pr-10 ${className}`}
        {...props}
      />
      
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>

      {showStrengthIndicator && (
        <PasswordStrengthIndicator 
          password={value} 
          onValidityChange={onValidityChange}
        />
      )}
    </div>
  )
}
