'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle } from 'lucide-react'

interface PaystackButtonProps {
  email: string
  amount: number // in naira
  reference?: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
  onSuccess?: (reference: string) => void
  onClose?: () => void
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  loadingText?: string
  buttonText?: string
  planName?: string
}

/**
 * Paystack Payment Button Component
 * 
 * This component initializes a Paystack payment popup.
 * The actual payment popup is handled by Paystack's inline script.
 */
export function PaystackButton({
  email,
  amount,
  reference: initialReference,
  metadata = {},
  callbackUrl,
  onSuccess,
  onClose,
  children,
  className,
  disabled = false,
  loadingText = 'Processing...',
  buttonText = 'Pay Now',
  planName,
}: PaystackButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // Load Paystack script on mount
  useState(() => {
    if (typeof window !== 'undefined' && !document.getElementById('paystack-script')) {
      const script = document.createElement('script')
      script.id = 'paystack-script'
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      script.onload = () => setIsScriptLoaded(true)
      document.body.appendChild(script)
    } else {
      setIsScriptLoaded(true)
    }
  })

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // First, initialize the payment on the server
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'one_time',
          amount,
          email,
          metadata: {
            ...metadata,
            plan_name: planName,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initialize payment')
      }

      const { authorizationUrl } = await response.json()

      // Redirect to Paystack payment page
      if (typeof window !== 'undefined') {
        window.location.href = authorizationUrl
      }
    } catch (error) {
      console.error('Payment initialization failed:', error)
      setIsLoading(false)
      // In production, show toast notification here
      alert(error instanceof Error ? error.message : 'Payment initialization failed')
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || buttonText}
        </>
      )}
    </Button>
  )
}

/**
 * Paystack Payment Modal Component
 * 
 * For inline payments (not redirect)
 */
interface PaystackModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  amount: number
  metadata?: Record<string, unknown>
  onSuccess?: (reference: string) => void
  reference?: string
}

export function PaystackPaymentModal({
  isOpen,
  onClose,
  email,
  amount,
  metadata = {},
  onSuccess,
  reference,
}: PaystackModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle')

  // This is a placeholder for inline Paystack integration
  // For full inline support, you'd use Paystack's React library
  
  if (!isOpen) return null

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'one_time',
          amount,
          email,
          metadata,
        }),
      })

      const data = await response.json()

      if (data.success) {
        window.location.href = data.authorizationUrl
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentStatus('failed')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        {paymentStatus === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4">Complete Payment</h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">
                  ₦{amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-sm">{email}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₦{amount.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaystackButton
