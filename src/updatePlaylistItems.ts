type UpdatePlaylistItemsResponse = {
  snapshot_id: string
}

/**
 * @see https://developer.spotify.com/documentation/web-api/reference/reorder-or-replace-playlists-tracks
 */
export async function updatePlaylistItems(token: string, playlistId: string, uris: string): Promise<UpdatePlaylistItemsResponse> {
  const params = new URLSearchParams();
  params.append("uris", uris)

  const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?${params.toString()}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  return result.json();
}
