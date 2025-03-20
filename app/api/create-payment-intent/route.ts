import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe with your secret key (use environment variable in production)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51Np8yhSJDATF3WXU9RyM9tEHHnJhbdX2IHZlJ1Hs1vZYPexmZJNBMQdyqmNgRGHQQGc8tFh3XJXf4axxiQwrwzTc00f9WEVUvJ', {
  apiVersion: '2025-02-24.acacia',
})

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, currency = 'usd', payment_method_types = ['card'], customerName = 'Anonymous' } = body

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency,
      payment_method_types,
      metadata: {
        integration_check: 'payment_test',
        customer_name: customerName
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}