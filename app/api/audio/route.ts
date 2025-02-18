import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import { AZURE_COGNITIVE_ENDPOINT } from '@/app/lib/constants'

async function fetchAudio(token: string, xml: string): Promise<string> {
  try {
    const response = await fetch(AZURE_COGNITIVE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-MICROSOFT-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
      },
      body: xml,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64String = Buffer.from(arrayBuffer).toString('base64')
    return base64String
  } catch (error) {
    console.error('Error fetching audio:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    // fetch token
    const tokenResponse = await fetch(`${req.nextUrl.origin}/api/token`, { method: 'POST' })

    if (!tokenResponse.ok) {
      throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`)
    }
    const { token } = await tokenResponse.json()
    const data = await req.text()

    // use token to request
    const base64Audio = await fetchAudio(token, data)
    return NextResponse.json({ base64Audio })
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
