"use client"

import { HowItWorks } from "@/components/how-it-works"

export default function HowItWorksPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">How It Works</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Our platform makes it easy to find, book, and pay for local services in just a few simple steps.
        </p>
      </div>
      
      <HowItWorks />
      
      <div className="mt-16 bg-muted rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">How do I book a service?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Search for your desired service, compare providers, select a time slot that works for you, and complete secure payment through our platform.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Are all service providers verified?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Yes, we verify all service providers on our platform to ensure quality and reliability. We check their credentials, experience, and customer reviews.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">What if I need to cancel or reschedule?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                You can cancel or reschedule bookings through your dashboard. Please note each provider may have their own cancellation policy.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">How do I pay for services?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We offer secure payment options including credit/debit cards and digital wallets. Your payment is only released to the provider after service completion.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">What if I'm not satisfied with a service?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                If you're unsatisfied with a service, you can contact the provider directly through our messaging system. If issues persist, our customer support team can assist.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">How do I become a service provider?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Sign up as a provider, complete your profile with relevant skills and experience, set your availability and rates, and start receiving booking requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 