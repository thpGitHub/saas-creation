import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Envoyer à Make pour publier sur LinkedIn
    const makeResponse = await fetch(process.env.MAKE_WEBHOOK_PUBLISH_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!makeResponse.ok) {
      throw new Error('Erreur Make');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur publication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la publication' },
      { status: 500 }
    );
  }
} 