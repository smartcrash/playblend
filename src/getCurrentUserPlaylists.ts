export async function getCurrentUserPlaylists(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return result.json();
}