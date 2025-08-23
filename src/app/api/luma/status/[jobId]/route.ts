import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_LUMA_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Luma AI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${params.jobId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to check job status: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking Luma AI job status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_LUMA_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Luma AI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${params.jobId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to cancel job: ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling Luma AI job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}