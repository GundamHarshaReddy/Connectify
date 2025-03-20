import { groq } from "@ai-sdk/groq"
import { streamText, convertToCoreMessages, tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = createClient()
  
    // Initialize the GROQ client correctly
    const model = groq("llama3-70b-8192")

    const result = await streamText({
      model,
      messages: convertToCoreMessages(messages),
      system: `You are a helpful assistant for the Local Services Connector platform. 
      Your goal is to help users find and book local service providers.
      Be friendly, concise, and helpful. If users ask about specific services, 
      providers, or locations, try to provide relevant information.
      If users want to book a service, guide them through the process.`,
      tools: {
        searchServices: tool({
          description: "Search for service providers based on category and location",
          parameters: z.object({
            category: z.string().describe("The service category to search for"),
            location: z.string().optional().describe("The location to search in (optional)"),
          }),
          execute: async ({ category, location }) => {
            // In a real implementation, this would query the Supabase database
            // For now, we'll return mock data
            const mockProviders = [
              {
                id: "1",
                name: "John Smith",
                category: "Plumbing",
                rating: 4.9,
                location: "New York, NY",
                hourlyRate: 75,
              },
              {
                id: "2",
                name: "Sarah Johnson",
                category: "Electrical",
                rating: 4.8,
                location: "Los Angeles, CA",
                hourlyRate: 85,
              },
              {
                id: "3",
                name: "Michael Brown",
                category: "Painting",
                rating: 4.7,
                location: "Chicago, IL",
                hourlyRate: 65,
              },
            ]
  
            // Filter by category (case-insensitive)
            const filteredByCategory = mockProviders.filter(
              (provider) => provider.category.toLowerCase() === category.toLowerCase(),
            )
  
            // If location is provided, filter by location as well
            const filteredProviders = location
              ? filteredByCategory.filter((provider) => provider.location.toLowerCase().includes(location.toLowerCase()))
              : filteredByCategory
  
            return {
              providers: filteredProviders,
              count: filteredProviders.length,
            }
          },
        }),
        getProviderAvailability: tool({
          description: "Get available time slots for a specific service provider",
          parameters: z.object({
            providerId: z.string().describe("The ID of the service provider"),
            date: z.string().describe("The date to check availability for (YYYY-MM-DD)"),
          }),
          execute: async ({ providerId, date }) => {
            // In a real implementation, this would query the database for the provider's availability
            // For now, we'll return mock data
            const mockTimeSlots = [
              { start: "09:00", end: "10:00" },
              { start: "10:30", end: "11:30" },
              { start: "13:00", end: "14:00" },
              { start: "15:30", end: "16:30" },
            ]
  
            return {
              providerId,
              date,
              availableTimeSlots: mockTimeSlots,
            }
          },
        }),
      },
    })
  
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chatbot API:", error)
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}