import { NextRequest, NextResponse } from 'next/server'

export interface FeedbackData {
  videoUrl: string
  originalPrompt: string
  enhancedPrompt?: string
  modelParams: any
  feedback: {
    rating: number
    qualityAspects: {
      videoQuality: boolean
      promptAdherence: boolean
      motionSmoothness: boolean
      audioQuality: boolean
      styleConsistency: boolean
    }
    specificFeedback: string
    timestamp: number
  }
}

// In-memory storage for demo. In production, use a database
const feedbackStore = new Map<string, FeedbackData[]>()

export async function POST(request: NextRequest) {
  try {
    const data: FeedbackData = await request.json()

    // Validate required fields
    if (!data.videoUrl || !data.originalPrompt || !data.feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a unique key for the original prompt
    const promptKey = data.originalPrompt.toLowerCase().trim()
    
    // Get existing feedback for this prompt or create new array
    const existingFeedback = feedbackStore.get(promptKey) || []
    
    // Add new feedback
    existingFeedback.push({
      ...data,
      feedback: {
        ...data.feedback,
        timestamp: data.feedback.timestamp || Date.now()
      }
    })
    
    // Store updated feedback
    feedbackStore.set(promptKey, existingFeedback)

    // Calculate aggregate statistics
    const allFeedback = existingFeedback.map(f => f.feedback)
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
    
    const qualityStats = Object.keys(data.feedback.qualityAspects).reduce((stats, aspect) => {
      const positiveCount = allFeedback.filter(f => 
        f.qualityAspects[aspect as keyof typeof f.qualityAspects]
      ).length
      stats[aspect] = (positiveCount / allFeedback.length) * 100
      return stats
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      feedbackId: `${promptKey}-${existingFeedback.length}`,
      aggregateStats: {
        totalFeedback: existingFeedback.length,
        averageRating: avgRating.toFixed(2),
        qualityStats
      }
    })
  } catch (error) {
    console.error('Error storing feedback:', error)
    return NextResponse.json(
      { error: 'Failed to store feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get('prompt')
    const videoUrl = searchParams.get('videoUrl')

    if (prompt) {
      // Get feedback for a specific prompt
      const promptKey = prompt.toLowerCase().trim()
      const feedback = feedbackStore.get(promptKey) || []
      
      return NextResponse.json({
        prompt,
        feedbackCount: feedback.length,
        feedback: feedback.map(f => ({
          ...f,
          // Remove sensitive data if needed
        }))
      })
    } else if (videoUrl) {
      // Get feedback for a specific video
      const allFeedback: FeedbackData[] = []
      feedbackStore.forEach(feedbackList => {
        const videoFeedback = feedbackList.filter(f => f.videoUrl === videoUrl)
        allFeedback.push(...videoFeedback)
      })
      
      return NextResponse.json({
        videoUrl,
        feedbackCount: allFeedback.length,
        feedback: allFeedback
      })
    } else {
      // Get all feedback summary
      const summary = Array.from(feedbackStore.entries()).map(([prompt, feedbackList]) => {
        const ratings = feedbackList.map(f => f.feedback.rating)
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        
        return {
          prompt,
          feedbackCount: feedbackList.length,
          averageRating: avgRating.toFixed(2),
          lastFeedback: feedbackList[feedbackList.length - 1]?.feedback.timestamp
        }
      })
      
      return NextResponse.json({
        totalPrompts: feedbackStore.size,
        totalFeedback: Array.from(feedbackStore.values()).reduce((sum, list) => sum + list.length, 0),
        summary
      })
    }
  } catch (error) {
    console.error('Error retrieving feedback:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve feedback' },
      { status: 500 }
    )
  }
}