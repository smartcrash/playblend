<!-- @format -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { redirectToAuthCodeFlow } from './redirectToAuthCodeFlow';
  import { getAccessToken } from './getAccessToken';
  import { getCurrentUserProfile } from './getCurrentUserProfile';
  import { getCurrentUserPlaylists, type GetCurrentUserPlaylistsResponse } from './getCurrentUserPlaylists';

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

  const token = localStorage.getItem('token');

  let loading = true;
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

  function handleSubmit({ target }: Event) {
    const formData = new FormData(target as HTMLFormElement);
    const selectedPlaylists = formData.getAll('playlist_ids').map(String);
    const data: Record<string, number> = {};

    for (const playlistId of selectedPlaylists) {
      const inputValue = formData.get(playlistId) as string | null;

      if (inputValue) {
        const value = Number(inputValue);
        if (value > 0) data[playlistId] = value;
      }
    }
  }
</script>

{#if loading}
  <p>Loading</p>
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    <main class="px-3 flex flex-col w-2/4 h-screen justify-center mx-auto space-y-3 pb-3 pt-3">
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

      <div>
        <button type="submit" class="text-center w-full bg-green-400 rounded-full py-3 font-bold">Create playlist</button>
      </div>
    </main>
  </form>
{/if}
