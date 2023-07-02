<!-- @format -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { redirectToAuthCodeFlow } from './api/redirectToAuthCodeFlow';
  import { getAccessToken } from './api/getAccessToken';
  import { getCurrentUserProfile } from './api/getCurrentUserProfile';
  import { getCurrentUserPlaylists, type GetCurrentUserPlaylistsResponse } from './api/getCurrentUserPlaylists';
  import { getPlaylistItems } from './api/getPlaylistItems';
  import { createPlaylist } from './api/createPlaylist';
  import { updatePlaylistItems } from './api/updatePlaylistItems';

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

  const token = localStorage.getItem('token');

  const shuffle = <T>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

  let loading = true;
  let error: string | null = null;
  let profile = {};
  let playlists: GetCurrentUserPlaylistsResponse = null;

  onMount(async () => {
    if (!token) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        redirectToAuthCodeFlow(CLIENT_ID);
      } else {
        const accessToken = await getAccessToken(CLIENT_ID, code);
        localStorage.setItem('token', accessToken);
        window.history.pushState('', document.title, document.location.href.split('?')[0]);
      }
    }

    profile = await getCurrentUserProfile(token);
    playlists = await getCurrentUserPlaylists(token);
    loading = false;
  });

  async function generatePlaylist(data: Record<string, number>): Promise<string[]> {
    const trackIds: string[] = [];

    for (const [playlistId, n] of Object.entries(data)) {
      const playlistTracks = await getPlaylistItems(token, playlistId);

      const itemIds = playlistTracks.items.map(({ track }) => track.id);
      const shuffledIds = shuffle(itemIds);
      const ids = shuffledIds.slice(0, n);

      trackIds.push(...ids);
    }

    return trackIds;
  }

  async function handleSubmit({ target }: Event) {
    error = null;

    const formData = new FormData(target as HTMLFormElement);
    const name = String(formData.get('name'));
    const selectedPlaylists = formData.getAll('playlist_ids').map(String);

    const data: Record<string, number> = {};

    if (!name) {
      error = 'Please enter the name of the Playlist.';
      return;
    }

    // TODO: Validate selected Playlist
    // TODO: Validate playlsit amount

    for (const playlistId of selectedPlaylists) {
      const inputValue = formData.get(playlistId) as string | null;

      if (inputValue) {
        const value = Number(inputValue);
        if (value > 0) data[playlistId] = value;
      }
    }

    const trackList = await generatePlaylist(data);
    const uris = trackList.map((id) => `spotify:track:${id}`).join(',');

    try {
      const { id: userId } = await getCurrentUserProfile(token);
      const { id: createdId } = await createPlaylist(token, userId, { name, collaborative: false, public: true });

      await updatePlaylistItems(token, createdId, uris);

      (target as HTMLFormElement).reset();
    } catch (error) {
      console.log(error);
      console.log((error as any).response);
    }
  }
</script>

{#if loading}
  <p>Loading</p>
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    <main class="px-3 flex flex-col w-2/4 h-screen justify-center mx-auto space-y-3 pb-3 pt-3">
      {#if error}
        <div class="bg-red-500 px-5 py-3 rounded-md text-white mb-2">
          {error}
        </div>
      {/if}

      <div class="flex-1 overflow-scroll pr-4 divide-y">
        {#each playlists.items as item}
          <label class="flex space-x-4 align-middle justify-center cursor-pointer select-none mb-4 pt-4">
            <div class="flex self-center">
              <input type="checkbox" value={item.id} name="playlist_ids" />
            </div>

            <div class="shrink-0">
              {#if item.images[0]}
                <img src={item.images[0].url} alt={item.name} class="w-20 h-auto rounded-xl pointer-events-none" />
              {:else}
                <div class="w-20 h-20 rounded-xl bg-gray-200" />
              {/if}
            </div>

            <div class="align-middle self-center flex-1">
              <h2 class="font-bold text-md">{item.name}</h2>
              <p class="text-sm text-gray-500 capitalize">{item.type}</p>
            </div>

            <div class="flex justify-center items-center">
              <input class="border-gray-400 text-gray-700 pl-2 py-1 border-2 w-16 rounded-md" type="number" name={item.id} min="0" value="0" />
            </div>
          </label>
        {/each}
      </div>

      <div class="space-y-3">
        <input type="text" name="name" id="" class="border-black w-full text-gray-700 border-b text-2xl bg-gray-50 px-4 py-2" placeholder="New Playlist" />
        <button type="submit" class="text-center w-full bg-green-400 rounded-full py-3 font-bold">Create playlist</button>
      </div>
    </main>
  </form>
{/if}
