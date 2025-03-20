import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Star, MapPin, CreditCard } from "lucide-react"
import ServiceCategoryCards from "@/components/service-category-cards"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Find Local Services You Can Trust
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Connect with verified tutors, repair professionals, and personal trainers in your area. Book
                  appointments, chat in real-time, and pay securely.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/get-started">
                  <Button className="h-11 px-8 gap-1">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/get-started">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/placeholder.svg?height=500&width=800"
                  alt="Local service providers"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Browse Service Categories</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Find the perfect service provider for your specific needs
              </p>
            </div>
          </div>
          <ServiceCategoryCards />
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Simple steps to find and book the services you need
              </p>
            </div>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Us</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform offers everything you need to find reliable local services
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Verified Providers</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                All service providers undergo thorough verification for your safety and peace of mind.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Geolocation</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Find service providers near you with our location-based search functionality.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Ratings & Reviews</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Make informed decisions based on authentic reviews from other customers.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Pay for services securely through our integrated payment system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Hear from people who have found amazing service providers on our platform
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-start space-y-3 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <h4 className="font-medium">Sarah T.</h4>
                  <p className="text-sm text-muted-foreground">New York, NY</p>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                "I found an amazing math tutor for my daughter through this platform. The booking process was simple,
                and the tutor has been fantastic!"
              </p>
            </div>
            <div className="flex flex-col items-start space-y-3 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <h4 className="font-medium">Michael R.</h4>
                  <p className="text-sm text-muted-foreground">Chicago, IL</p>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                "When my AC broke down, I needed help fast. Found a repair professional nearby who came the same day.
                Great service!"
              </p>
            </div>
            <div className="flex flex-col items-start space-y-3 border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <h4 className="font-medium">Jennifer L.</h4>
                  <p className="text-sm text-muted-foreground">Los Angeles, CA</p>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                "I've been working with a personal trainer I found here for three months now. The secure payment system
                makes it easy to manage my sessions."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                Join thousands of satisfied users who have found the perfect service providers for their needs.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/get-started">
                <Button size="lg" variant="secondary" className="gap-1">
                  Get Started Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

