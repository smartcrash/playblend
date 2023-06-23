type CreatePlaylistResponse = {
  id: string
}


/**
 * @see https://developer.spotify.com/documentation/web-api/reference/create-playlist
 */
export async function createPlaylist(
  token: string,
  userId: string,
  bodyParams: { name: string, public?: boolean, collaborative?: boolean, description?: string }
): Promise<CreatePlaylistResponse> {
  const result = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyParams)
  });

  return result.json();
}
