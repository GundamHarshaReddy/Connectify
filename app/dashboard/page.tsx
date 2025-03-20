"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"
import DashboardRedirect from '@/components/DashboardRedirect'
import { loadStripe } from '@stripe/stripe-js'
import PaymentTestForm from '@/components/PaymentTestForm'
import { useSearchParams } from 'next/navigation'
import AuthGuard from "@/components/AuthGuard"

// Initialize Stripe with a public key from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx')

type Booking = {
  id: string
  provider_name: string
  provider_avatar: string
  service: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

type Message = {
  id: string
  sender_name: string
  sender_avatar: string
  content: string
  created_at: string
  unread: boolean
}

type Payment = {
  id: number
  customer_name: string
  amount: number
  payment_date: string
  status: string
  payment_method: string
}

export default function DashboardPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const { supabase } = useSupabase()
  const [session, setSession] = useState<any>(null)
  const searchParams = useSearchParams()

  // Get session on component mount and check validity
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      // If no session is found, redirect to login
      if (!currentSession) {
        window.location.href = '/auth/login?redirectedFrom=/dashboard'
        return
      }
      
      setSession(currentSession)
    }
    getSession()
  }, [supabase])

  // Check for payment success in URL parameters
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const amount = searchParams.get('amount')
    const name = searchParams.get('name')
    
    if (paymentStatus === 'success' && session?.user && amount && name) {
      // Save payment to database when redirected from successful payment
      const savePayment = async () => {
        try {
          const { data, error } = await supabase
            .from('payments')
            .insert({
              user_id: session.user.id,
              customer_name: decodeURIComponent(name),
              amount: parseFloat(amount),
              status: 'completed',
              payment_date: new Date().toISOString(),
              payment_method: 'card',
            })
            
          if (error) {
            console.error('Error saving payment:', error)
          } else {
            // Refresh payment list
            fetchPayments()
          }
        } catch (err) {
          console.error('Error saving payment details:', err)
        }
      }
      
      savePayment()
    }
  }, [searchParams, session, supabase])
  
  // Fetch payment history
  const fetchPayments = async () => {
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('payment_date', { ascending: false })
          
        if (error) {
          console.error('Error fetching payments:', error)
        } else {
          setPayments(data || [])
        }
      } catch (err) {
        console.error('Error fetching payment history:', err)
      }
    }
  }
  
  useEffect(() => {
    fetchPayments()
  }, [session, supabase])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  return (
    <AuthGuard>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500 dark:text-gray-400">
              You have no recent activity.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Services</h2>
            <p className="text-gray-500 dark:text-gray-400">
              You have no upcoming services scheduled.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Services Booked</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment History Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <CreditCard className="h-5 w-5 text-gray-500" />
          </div>
          
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b dark:border-gray-700">
                      <td className="py-3">{payment.customer_name}</td>
                      <td className="py-3">{formatDate(payment.payment_date)}</td>
                      <td className="py-3">${payment.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3">{payment.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              You have no payment history yet.
            </p>
          )}
        </div>
        
        {/* Payment Testing Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Test Payment</h2>
            <CreditCard className="h-5 w-5 text-gray-500" />
          </div>
          
          {!showPaymentForm ? (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Test our payment system with Stripe's test cards. No real money will be charged.
              </p>
              <Button onClick={() => setShowPaymentForm(true)}>
                Make Test Payment
              </Button>
            </div>
          ) : (
            <PaymentTestForm onCancel={() => setShowPaymentForm(false)} />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

