import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const platform = params.platform

    if (!code) {
      throw new Error('No authorization code received')
    }

    let tokenResponse
    let userData

    switch (platform) {
      case 'tiktok':
        tokenResponse = await exchangeTikTokToken(code)
        userData = await getTikTokUserData(tokenResponse.access_token)
        break
      case 'facebook':
        tokenResponse = await exchangeFacebookToken(code)
        userData = await getFacebookUserData(tokenResponse.access_token)
        break
      case 'instagram':
        tokenResponse = await exchangeInstagramToken(code)
        userData = await getInstagramUserData(tokenResponse.access_token)
        break
      default:
        throw new Error('Invalid platform')
    }

    // Store tokens securely in cookies
    const cookieStore = cookies()
    cookieStore.set(`${platform}_access_token`, tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    if (tokenResponse.refresh_token) {
      cookieStore.set(`${platform}_refresh_token`, tokenResponse.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
    }

    // Return success page that sends message to parent window
    return new Response(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: '${platform}-login',
              platform: '${platform}',
              userData: ${JSON.stringify(userData)}
            }, '*');
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html'
      }
    })

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

async function exchangeTikTokToken(code: string) {
  const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange TikTok token')
  }

  return response.json()
}

async function exchangeFacebookToken(code: string) {
  const response = await fetch('https://graph.facebook.com/v12.0/oauth/access_token', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook token')
  }

  return response.json()
}

async function exchangeInstagramToken(code: string) {
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Instagram token')
  }

  return response.json()
}

async function getTikTokUserData(accessToken: string) {
  const response = await fetch('https://open-api.tiktok.com/user/info/', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch TikTok user data')
  }

  return response.json()
}

async function getFacebookUserData(accessToken: string) {
  const response = await fetch('https://graph.facebook.com/me?fields=id,name,email', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook user data')
  }

  return response.json()
}

async function getInstagramUserData(accessToken: string) {
  const response = await fetch('https://graph.instagram.com/me?fields=id,username', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram user data')
  }

  return response.json()
} 