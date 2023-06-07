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
</script>

{#if loading}
  <p>Loading</p>
{:else}
  <!-- <main class="sm:w-7/12 mx-5 sm:mx-auto"> -->
  <main class="mt-6 px-3">
    <div class="flex space-x-5 w-full overflow-scroll pb-4">
      {#each playlists.items as item, index}
        <div class="flex space-x-2 shrink-0" role="button">
          <div>
            {#if item.images[0]}
              <img src={item.images[0].url} alt={item.name} class="w-20 h-auto rounded-xl" />
            {:else}
              <div class="w-20 h-20 rounded-xl bg-gray-200" />
            {/if}
          </div>

          <div class="align-middle self-center">
            <h2 class="font-bold text-md">{item.name}</h2>
            <p class="text-sm text-gray-500 capitalize">{item.type}</p>
          </div>
        </div>
      {/each}
    </div>
  </main>
{/if}
