import { NextRequest, NextResponse } from 'next/server'
// Fixed TypeScript error - data variable is now scoped correctly

interface RefinePromptRequest {
  originalPrompt: string
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
  }
  modelParams?: Record<string, string | number | boolean | null>
}

export async function POST(request: NextRequest) {
  try {
    const data: RefinePromptRequest = await request.json()
    
    if (!data.originalPrompt || !data.feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build refinement instructions based on feedback
    const refinementInstructions = buildRefinementInstructions(data.feedback)
    
    // Construct the prompt for Claude to refine
    const systemPrompt = `You are an expert at refining video generation prompts for Veo 3. 
    Based on user feedback, improve the prompt to address the issues while maintaining the original intent.
    
    Focus on:
    1. Being more specific and descriptive
    2. Adding missing elements that caused quality issues
    3. Using Veo 3 best practices
    4. Maintaining the original creative vision
    
    Return ONLY the refined prompt without any explanation.`

    const userPrompt = `Original prompt: "${data.originalPrompt}"
    
    User rating: ${data.feedback.rating}/5
    
    Quality issues:
    ${refinementInstructions}
    
    ${data.feedback.specificFeedback ? `User's specific feedback: "${data.feedback.specificFeedback}"` : ''}
    
    Please refine this prompt to address these issues.`

    // Try Replicate API first, fall back to OpenRouter if not configured
    let response: Response;
    
    if (process.env.REPLICATE_API_TOKEN) {
      // Use Meta's Llama model via Replicate for prompt refinement
      const replicate = await import('replicate').then(m => new m.default({
        auth: process.env.REPLICATE_API_TOKEN,
      }));
      
      try {
        const output = await replicate.run(
          "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
          {
            input: {
              prompt: `${systemPrompt}\n\n${userPrompt}`,
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1
            }
          }
        );
        
        const refinedPrompt = Array.isArray(output) ? output.join('') : String(output);
        
        // Skip the OpenRouter call if Replicate succeeded
        if (refinedPrompt && refinedPrompt.trim()) {
          // Add quality improvements based on feedback
          const enhancedPrompt = addQualityEnhancements(refinedPrompt.trim(), data.feedback)
          
          return NextResponse.json({
            refinedPrompt: enhancedPrompt,
            improvements: getImprovementSummary(data.feedback),
            originalPrompt: data.originalPrompt,
            model: 'meta/llama-2-70b-chat'
          })
        }
      } catch (replicateError) {
        console.log('Replicate API failed, falling back to OpenRouter:', replicateError)
      }
    }
    
    // Fall back to OpenRouter (Claude)
    response = await fetch(
      `${process.env.NEXT_PUBLIC_OPENROUTER_API_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Prompt Builder'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet:beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to refine prompt with AI')
    }

    const aiResponse = await response.json()
    const refinedPrompt = aiResponse.choices[0]?.message?.content?.trim()

    if (!refinedPrompt) {
      throw new Error('AI did not return a refined prompt')
    }

    // Add quality improvements based on feedback
    const enhancedPrompt = addQualityEnhancements(refinedPrompt, data.feedback)

    return NextResponse.json({
      refinedPrompt: enhancedPrompt,
      improvements: getImprovementSummary(data.feedback),
      originalPrompt: data.originalPrompt
    })
  } catch (error) {
    console.error('Error refining prompt:', error)
    
    // Return error response if we couldn't parse the request
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function buildRefinementInstructions(feedback: RefinePromptRequest['feedback']): string {
  const issues = []
  
  if (!feedback.qualityAspects.videoQuality) {
    issues.push('- Video quality/clarity needs improvement: Add resolution, lighting, and visual quality descriptors')
  }
  if (!feedback.qualityAspects.promptAdherence) {
    issues.push('- Not following prompt instructions: Be more specific about actions, subjects, and scenes')
  }
  if (!feedback.qualityAspects.motionSmoothness) {
    issues.push('- Motion/animation is not smooth: Specify movement speed, fluidity, and transitions')
  }
  if (!feedback.qualityAspects.audioQuality) {
    issues.push('- Audio quality issues: Add audio descriptors or specify "no audio" if not needed')
  }
  if (!feedback.qualityAspects.styleConsistency) {
    issues.push('- Inconsistent style: Add specific style keywords (cinematic, realistic, animated, etc.)')
  }
  
  return issues.join('\n')
}

function addQualityEnhancements(prompt: string, feedback: RefinePromptRequest['feedback']): string {
  let enhanced = prompt
  
  // Add quality descriptors if missing
  if (!feedback.qualityAspects.videoQuality && !prompt.toLowerCase().includes('quality')) {
    enhanced += ', high quality, 4K resolution, sharp details'
  }
  
  // Add motion descriptors if missing
  if (!feedback.qualityAspects.motionSmoothness && !prompt.toLowerCase().includes('smooth')) {
    enhanced += ', smooth motion, fluid movement'
  }
  
  // Add style consistency if missing
  if (!feedback.qualityAspects.styleConsistency && !hasStyleKeywords(prompt)) {
    enhanced += ', consistent cinematic style'
  }
  
  return enhanced
}

function hasStyleKeywords(prompt: string): boolean {
  const styleKeywords = [
    'cinematic', 'realistic', 'animated', 'artistic', 'photorealistic',
    'stylized', 'documentary', 'professional', 'aesthetic'
  ]
  const lowerPrompt = prompt.toLowerCase()
  return styleKeywords.some(keyword => lowerPrompt.includes(keyword))
}

// Removed unused performRuleBasedRefinement and extractKeywordsFromFeedback functions

function getImprovementSummary(feedback: RefinePromptRequest['feedback']): string[] {
  const improvements = []
  
  if (!feedback.qualityAspects.videoQuality) {
    improvements.push('Enhanced video quality and resolution')
  }
  if (!feedback.qualityAspects.promptAdherence) {
    improvements.push('Improved prompt specificity and clarity')
  }
  if (!feedback.qualityAspects.motionSmoothness) {
    improvements.push('Added motion smoothness descriptors')
  }
  if (!feedback.qualityAspects.audioQuality) {
    improvements.push('Clarified audio requirements')
  }
  if (!feedback.qualityAspects.styleConsistency) {
    improvements.push('Added style consistency keywords')
  }
  
  return improvements
}