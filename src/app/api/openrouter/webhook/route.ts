import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook data for debugging
    console.log('OpenRouter webhook received:', {
      id: body.id,
      status: body.status,
      model: body.model
    });

    // In a production app, you would:
    // 1. Validate the webhook signature
    // 2. Update the generation status in your database
    // 3. Notify the user if needed (via WebSocket, polling, etc.)
    
    // For now, just acknowledge receipt
    return NextResponse.json({ 
      received: true,
      id: body.id 
    });
  } catch (error) {
    console.error('OpenRouter webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid webhook payload' },
      { status: 400 }
    );
  }
}

// OpenRouter webhooks can also use GET for status checks
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'openrouter-webhook' 
  });
}