import React, { useState } from 'react'
import { Star, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface FeedbackCollectorProps {
  videoUrl: string
  originalPrompt: string
  enhancedPrompt?: string
  modelParams: Record<string, string | number | boolean | null>
  onRefineAndRegenerate: (refinedPrompt: string, feedback: VideoFeedback) => void
  onClose?: () => void
}

export interface VideoFeedback {
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

export function FeedbackCollector({
  videoUrl,
  originalPrompt,
  enhancedPrompt,
  modelParams,
  onRefineAndRegenerate,
  onClose
}: FeedbackCollectorProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [qualityAspects, setQualityAspects] = useState({
    videoQuality: false,
    promptAdherence: false,
    motionSmoothness: false,
    audioQuality: false,
    styleConsistency: false
  })
  const [specificFeedback, setSpecificFeedback] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleQualityToggle = (aspect: keyof typeof qualityAspects) => {
    setQualityAspects(prev => ({
      ...prev,
      [aspect]: !prev[aspect]
    }))
  }

  const handleRefineAndRegenerate = async () => {
    console.log('Refine button clicked! Current rating:', rating)
    
    if (rating === 0) {
      console.log('No rating provided, showing toast')
      toast({
        title: "Rating Required",
        description: "Please provide a rating before refining the prompt",
        variant: "destructive"
      })
      return
    }

    setIsRefining(true)

    const feedback: VideoFeedback = {
      rating,
      qualityAspects,
      specificFeedback,
      timestamp: Date.now()
    }

    try {
      // Store feedback
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          originalPrompt,
          enhancedPrompt,
          modelParams,
          feedback
        })
      })

      // Get refined prompt based on feedback
      console.log('Sending refinement request with:', {
        originalPrompt: enhancedPrompt || originalPrompt,
        feedback,
        modelParams
      })
      
      const refinementResponse = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: enhancedPrompt || originalPrompt,
          feedback,
          modelParams
        })
      })

      console.log('Refinement response status:', refinementResponse.status)

      if (!refinementResponse.ok) {
        const errorText = await refinementResponse.text()
        console.error('Refinement error:', errorText)
        throw new Error(`Failed to refine prompt: ${errorText}`)
      }

      const refinementData = await refinementResponse.json()
      console.log('Refinement response data:', refinementData)
      
      const { refinedPrompt } = refinementData
      
      console.log('Calling onRefineAndRegenerate with:', refinedPrompt)
      onRefineAndRegenerate(refinedPrompt, feedback)
      
      toast({
        title: "Prompt Refined",
        description: "Your prompt has been refined based on your feedback. Regenerating video..."
      })
    } catch (error) {
      console.error('Error refining prompt:', error)
      toast({
        title: "Error",
        description: "Failed to refine prompt. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefining(false)
    }
  }

  const qualityLabels = {
    videoQuality: "Video Quality/Clarity",
    promptAdherence: "Follows Prompt Instructions",
    motionSmoothness: "Smooth Motion/Animation",
    audioQuality: "Audio Quality (if applicable)",
    styleConsistency: "Consistent Style/Aesthetics"
  }

  const getRatingMessage = () => {
    if (rating === 0) return "Rate this video to provide feedback"
    if (rating <= 2) return "Let's improve this together"
    if (rating === 3) return "Good, but room for improvement"
    if (rating >= 4) return "Great result!"
    return ""
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">How was this video?</h3>
        <p className="text-sm text-muted-foreground">{getRatingMessage()}</p>
      </div>

      {/* Star Rating */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Rating:</span>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-colors"
            >
              <Star
                className={`w-6 h-6 ${
                  value <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Quality Aspects */}
      {rating > 0 && rating <= 3 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">What could be improved?</p>
          <div className="space-y-2">
            {Object.entries(qualityLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={!qualityAspects[key as keyof typeof qualityAspects]}
                  onCheckedChange={() => handleQualityToggle(key as keyof typeof qualityAspects)}
                />
                <Label
                  htmlFor={key}
                  className="text-sm cursor-pointer select-none"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">
          Specific feedback (optional)
        </Label>
        <Textarea
          id="feedback"
          value={specificFeedback}
          onChange={(e) => setSpecificFeedback(e.target.value)}
          placeholder="Describe what you'd like to see differently..."
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isRefining}
        >
          Close
        </Button>
        
        <Button
          onClick={handleRefineAndRegenerate}
          disabled={rating === 0 || isRefining}
          className="gap-2"
          title={rating === 0 ? "Please select a rating first" : "Refine prompt and regenerate video"}
        >
          <RefreshCw className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} />
          Refine & Regenerate
        </Button>
      </div>

      {/* Feedback Tips */}
      {rating > 0 && rating <= 3 && (
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Tips for better results:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {!qualityAspects.promptAdherence && (
                  <li>Be more specific about actions and movements</li>
                )}
                {!qualityAspects.styleConsistency && (
                  <li>Include style keywords (cinematic, realistic, animated)</li>
                )}
                {!qualityAspects.videoQuality && (
                  <li>Specify resolution and quality preferences</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}