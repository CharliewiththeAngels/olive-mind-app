"use client"

export interface TestQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

export interface WorkBrief {
  id: string
  shift_id: string
  title: string
  brand_name: string
  shift_title: string
  description: string

  // Training Video
  training_video_url: string | null
  video_duration?: number // in minutes
  video_description?: string

  // Brand Information
  brand_information: string | null
  brand_guidelines?: string
  key_messages?: string[]
  dos_and_donts?: {
    dos: string[]
    donts: string[]
  }

  // Test
  test_questions: TestQuestion[]
  passing_score: number // percentage required to pass
  max_attempts: number

  status: "draft" | "published"
  created_at: string
  updated_at: string
}

// Mock work briefs data
const mockWorkBriefs: WorkBrief[] = [
  {
    id: "1",
    shift_id: "1", // Woolworths Promotion
    title: "Woolworths Product Sampling Training",
    brand_name: "Woolworths",
    shift_title: "Woolworths Promotion",
    description: "Complete training package for Woolworths product sampling and customer engagement",

    training_video_url: "https://example.com/woolworths-training.mp4",
    video_duration: 15,
    video_description: "Learn proper sampling techniques, customer approach, and brand representation",

    brand_information: `# Woolworths Brand Guidelines

## About Woolworths
Woolworths is South Africa's premium food retailer, known for quality, freshness, and exceptional customer service.

## Our Values
- Quality: We never compromise on quality
- Freshness: Fresh products every day
- Service: Exceptional customer experience
- Innovation: Always improving

## Customer Approach
- Greet customers warmly with a smile
- Offer samples enthusiastically
- Share product benefits and features
- Be knowledgeable about ingredients and preparation
- Thank customers for their time

## Key Messages
- "Taste the Woolworths difference"
- "Quality you can trust"
- "Fresh, every day"`,

    brand_guidelines:
      "Always wear the provided Woolworths uniform. Maintain a clean and professional appearance. Speak positively about all Woolworths products.",

    key_messages: [
      "Taste the Woolworths difference",
      "Quality you can trust",
      "Fresh, every day",
      "Premium ingredients, exceptional taste",
    ],

    dos_and_donts: {
      dos: [
        "Smile and greet every customer",
        "Keep sampling area clean and organized",
        "Offer samples to all passing customers",
        "Share product information enthusiastically",
        "Thank customers for trying the product",
      ],
      donts: [
        "Never force customers to try samples",
        "Don't eat the samples yourself",
        "Don't leave the sampling station unattended",
        "Don't speak negatively about competitors",
        "Don't use your phone during work hours",
      ],
    },

    test_questions: [
      {
        id: "1",
        question: "What is Woolworths' main brand promise?",
        options: ["Lowest prices", "Quality you can trust", "Fastest service", "Biggest selection"],
        correct_answer: 1,
        explanation: "Woolworths is known for quality and trustworthiness, not necessarily the lowest prices.",
      },
      {
        id: "2",
        question: "How should you approach customers for sampling?",
        options: ["Wait for them to ask", "Greet warmly with a smile", "Call out loudly", "Follow them around"],
        correct_answer: 1,
        explanation: "A warm, friendly greeting with a smile is the best way to engage customers.",
      },
      {
        id: "3",
        question: "What should you do if a customer doesn't want to try a sample?",
        options: ["Insist they try it", "Thank them politely", "Ask why not", "Ignore them"],
        correct_answer: 1,
        explanation: "Always respect customer choices and thank them politely for their time.",
      },
      {
        id: "4",
        question: "Which of these is a key Woolworths value?",
        options: ["Speed", "Freshness", "Volume", "Convenience"],
        correct_answer: 1,
        explanation: "Freshness is one of Woolworths' core values along with quality and service.",
      },
      {
        id: "5",
        question: "What should you wear during the promotion?",
        options: ["Your own clothes", "Woolworths uniform", "Casual wear", "Formal attire"],
        correct_answer: 1,
        explanation: "Always wear the provided Woolworths uniform to maintain brand consistency.",
      },
    ],

    passing_score: 80,
    max_attempts: 3,
    status: "published",
    created_at: "2024-12-01T10:00:00",
    updated_at: "2024-12-01T10:00:00",
  },
  {
    id: "2",
    shift_id: "2", // Amstel Radler Promotion
    title: "Amstel Radler Brand Training",
    brand_name: "Amstel Radler",
    shift_title: "Amstel Radler Promotion",
    description: "Training for Amstel Radler product promotion and customer engagement",

    training_video_url: "https://example.com/amstel-training.mp4",
    video_duration: 12,
    video_description: "Learn about Amstel Radler's unique positioning and promotion techniques",

    brand_information: `# Amstel Radler Brand Training

## About Amstel Radler
Amstel Radler is a refreshing beer and lemon mix, perfect for social occasions and hot weather.

## Product Features
- 2% alcohol content
- Natural lemon flavor
- Refreshing and light
- Perfect for any time of day

## Target Audience
- Young adults (21-35)
- Social drinkers
- People looking for lighter alternatives
- Hot weather refreshment seekers

## Promotion Details
Customers who buy 2-3 cases receive a promo kit and enter to win R5000 in prizes.`,

    key_messages: [
      "Refreshingly different",
      "Perfect mix of beer and lemon",
      "Light and refreshing",
      "Your new favorite drink",
    ],

    dos_and_donts: {
      dos: [
        "Check customer age before offering samples",
        "Explain the promotion clearly",
        "Collect till slips properly",
        "Put entries in the entry box",
        "Notify reps about the entry box",
      ],
      donts: [
        "Don't serve to anyone under 21",
        "Don't forget to collect till slips",
        "Don't lose the entry box",
        "Don't drink the product during work",
        "Don't forget to take photos",
      ],
    },

    test_questions: [
      {
        id: "1",
        question: "What is the alcohol content of Amstel Radler?",
        options: ["1%", "2%", "3%", "5%"],
        correct_answer: 1,
        explanation: "Amstel Radler has a low 2% alcohol content, making it a light option.",
      },
      {
        id: "2",
        question: "How many cases must customers buy to get the promo kit?",
        options: ["1 case", "2-3 cases", "4-5 cases", "6+ cases"],
        correct_answer: 1,
        explanation: "Customers need to purchase 2-3 cases to receive the promotional kit.",
      },
      {
        id: "3",
        question: "What must customers submit to enter the competition?",
        options: ["Business card", "Till slip with details", "Photo", "Email address"],
        correct_answer: 1,
        explanation: "Customers must submit their till slip with name, surname, and number.",
      },
    ],

    passing_score: 75,
    max_attempts: 3,
    status: "published",
    created_at: "2024-12-02T14:00:00",
    updated_at: "2024-12-02T14:00:00",
  },
  {
    id: "3",
    shift_id: "3", // Coca-Cola Activation
    title: "Coca-Cola Brand Activation Training",
    brand_name: "Coca-Cola",
    shift_title: "Coca-Cola Activation",
    description: "Comprehensive training for Coca-Cola brand activation and customer interaction",

    training_video_url: null, // Not uploaded yet
    video_duration: 20,
    video_description: "Complete guide to Coca-Cola brand values and activation techniques",

    brand_information: `# Coca-Cola Brand Training

## The Coca-Cola Company
The world's largest beverage company, bringing happiness and refreshment to billions.

## Brand Values
- Happiness and optimism
- Authenticity and real connections
- Quality and excellence
- Inclusivity and diversity

## Campaign Focus
This activation focuses on sharing happiness and creating memorable moments with customers.`,

    key_messages: ["Open happiness", "Taste the feeling", "Share a Coke", "Real magic happens"],

    test_questions: [],

    passing_score: 80,
    max_attempts: 3,
    status: "draft",
    created_at: "2024-12-03T09:00:00",
    updated_at: "2024-12-03T09:00:00",
  },
]

export const getWorkBriefs = async (): Promise<WorkBrief[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockWorkBriefs
}

export const getWorkBriefByShift = async (shiftId: string): Promise<WorkBrief | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockWorkBriefs.find((brief) => brief.shift_id === shiftId) || null
}

export const createWorkBrief = async (
  briefData: Omit<WorkBrief, "id" | "created_at" | "updated_at">,
): Promise<WorkBrief> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newBrief: WorkBrief = {
    ...briefData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockWorkBriefs.push(newBrief)
  return newBrief
}

export const updateWorkBrief = async (id: string, updates: Partial<WorkBrief>): Promise<WorkBrief> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const briefIndex = mockWorkBriefs.findIndex((brief) => brief.id === id)
  if (briefIndex === -1) {
    throw new Error("Work brief not found")
  }

  const updatedBrief = {
    ...mockWorkBriefs[briefIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  mockWorkBriefs[briefIndex] = updatedBrief
  return updatedBrief
}

export const deleteWorkBrief = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const briefIndex = mockWorkBriefs.findIndex((brief) => brief.id === id)
  if (briefIndex === -1) {
    throw new Error("Work brief not found")
  }

  mockWorkBriefs.splice(briefIndex, 1)
}
