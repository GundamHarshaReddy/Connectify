import { Search, CheckCircle, Calendar, Star } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Find Local Providers",
      description: "Search for tutors, repair professionals, or personal trainers in your area.",
      icon: <Search className="h-6 w-6 text-primary" />,
    },
    {
      number: "2",
      title: "Compare & Choose",
      description: "Read reviews, check ratings, and compare prices to find the right provider.",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      number: "3",
      title: "Book & Pay Securely",
      description: "Select a convenient time slot and book your service with secure payment.",
      icon: <Calendar className="h-6 w-6 text-primary" />,
    },
    {
      number: "4",
      title: "Get Service & Review",
      description: "Receive quality service from verified professionals and share your experience.",
      icon: <Star className="h-6 w-6 text-primary" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
      {steps.map((step) => (
        <div key={step.number} className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">{step.icon}</div>
          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
          <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
        </div>
      ))}
    </div>
  )
}

