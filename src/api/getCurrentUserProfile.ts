export type GetCurrentUserProfileResponse = {
  country: string
  display_name: string
  email: string
  explicit_content: {
    filter_enabled: boolean
    filter_locked: boolean
  }
  external_urls: {
    spotify: string
  }
  followers: {
    href: string
    total: number
  }
  href: string
  id: string
  images: {
    url: string
    height: number
    width: number
  }[]
  product: string
  type: string
  uri: string
} | {
  error: {
    status: number
    message: string
  }
}


export async function getCurrentUserProfile(token: string): Promise<GetCurrentUserProfileResponse> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.json();
}
