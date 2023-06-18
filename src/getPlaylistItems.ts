/**
 * @see https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
 */
export async function getPlaylistItems(token: string, playlistId: string): Promise<any> {
  const params = new URLSearchParams();
  params.append("limit", '50')
  params.append("offset", '0');
  params.append("fields", 'items(track(id,name,artists(name)))');

  const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  return result.json();
}
