"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, CheckCircle } from "lucide-react"

type PaymentFormProps = {
  amount: number
  onPaymentComplete: () => void
  onCancel: () => void
}

export default function PaymentForm({ amount, onPaymentComplete, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "paypal">("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)

      // Notify parent component after a brief delay to show success state
      setTimeout(() => {
        onPaymentComplete()
      }, 1500)
    }, 2000)
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>
        <h3 className="text-xl font-bold">Payment Successful</h3>
        <p className="text-center text-muted-foreground">
          Your payment of ${amount.toFixed(2)} has been processed successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payment Details</h3>
        <p className="text-sm text-muted-foreground">Complete your booking by making a secure payment.</p>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount</span>
          <span className="text-xl font-bold">${amount.toFixed(2)}</span>
        </div>
      </div>

      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "credit-card" | "paypal")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="credit-card" id="credit-card" />
          <Label htmlFor="credit-card" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Credit/Debit Card
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <Label htmlFor="paypal">PayPal</Label>
        </div>
      </RadioGroup>

      <Separator />

      {paymentMethod === "credit-card" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-name">Name on Card</Label>
            <Input
              id="card-name"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment.</p>
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Continue to PayPal"}
            </Button>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        <p>Your payment information is encrypted and secure.</p>
        <p>We do not store your full card details.</p>
      </div>
    </div>
  )
}

