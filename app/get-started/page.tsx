"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Star, MapPin, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function GetStarted() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Get Started
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mx-auto">
                Welcome to our platform! Choose how you'd like to continue.
              </p>
            </div>
            
            {/* Fix the hero image path - use correct path from public folder */}
            <div className="w-full max-w-3xl relative h-[300px] mb-8 rounded-lg overflow-hidden">
              <Image 
                src="/download.jpeg"
                alt="Platform Hero Image"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Looking for Services?</CardTitle>
                  <CardDescription>Find and book local service providers for your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Browse verified providers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Schedule appointments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Pay securely online</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/register?role=customer" className="w-full">
                    <Button size="lg" className="w-full">
                      Sign Up as Customer
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Offering Services?</CardTitle>
                  <CardDescription>Join our network of professional service providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Reach new customers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Manage your bookings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Get paid reliably</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/register?role=provider" className="w-full">
                    <Button size="lg" className="w-full">
                      Sign Up as Provider
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Already have an account?
              </p>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-16 w-full max-w-4xl">
              <h2 className="text-3xl font-bold mb-8">Why Choose Our Platform?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Fix the features image path */}
                <div className="relative h-[250px] rounded-lg overflow-hidden">
                  <Image 
                    src="/download.jpeg"
                    alt="Platform Features"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                </div>
                <div className="text-left space-y-4">
                  <div className="flex items-start space-x-3">
                    <Star className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Verified Reviews</h3>
                      <p className="text-gray-500 dark:text-gray-400">See ratings and reviews from real customers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Local Providers</h3>
                      <p className="text-gray-500 dark:text-gray-400">Find trusted professionals in your area</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Secure Payments</h3>
                      <p className="text-gray-500 dark:text-gray-400">Pay safely through our protected platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}