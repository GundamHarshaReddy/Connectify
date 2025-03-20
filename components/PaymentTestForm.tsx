"use client"

import { useState, useEffect } from 'react'
import { useElements, useStripe, PaymentElement, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"

// Initialize Stripe with a test key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')

function CheckoutForm({ onCancel, amount, customerName }: { onCancel: () => void, amount: number, customerName: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const { supabase, session } = useSupabase()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment=success&amount=${amount}&name=${encodeURIComponent(customerName)}`,
      },
      redirect: 'if_required',
    })

    setLoading(false)

    if (result.error) {
      setError(result.error.message || 'An error occurred during payment')
    } else {
      setSucceeded(true)
      
      // Save payment information to database
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('payments')
            .insert({
              user_id: session.user.id,
              customer_name: customerName,
              amount: amount,
              status: 'completed',
              payment_date: new Date().toISOString(),
              payment_method: 'card',
            })
            
          if (error) {
            console.error('Error saving payment:', error)
          }
        } catch (err) {
          console.error('Error saving payment details:', err)
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>Enter your card details to make a test payment</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          {succeeded && <p className="text-green-500 mt-2">Payment succeeded!</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={!stripe || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default function PaymentTestForm({ onCancel }: { onCancel: () => void }) {
  const [clientSecret, setClientSecret] = useState('')
  const [amount, setAmount] = useState(10)
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)

  const createPaymentIntent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          customerName: customerName,
        }),
      })

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error('Error creating payment intent:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {!clientSecret ? (
        <Card>
          <CardHeader>
            <CardTitle>Test Payment</CardTitle>
            <CardDescription>Enter details to test the payment system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Your Name</Label>
                <Input 
                  id="customerName" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="1" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button 
              onClick={createPaymentIntent} 
              disabled={loading || !customerName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm onCancel={onCancel} amount={amount} customerName={customerName} />
        </Elements>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Test Card Numbers:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Success: 4242 4242 4242 4242</li>
          <li>Requires Authentication: 4000 0025 0000 3155</li>
          <li>Declined: 4000 0000 0000 0002</li>
        </ul>
        <p className="mt-2">Use any future expiration date, any 3-digit CVC, and any postal code.</p>
      </div>
    </div>
  )
}
