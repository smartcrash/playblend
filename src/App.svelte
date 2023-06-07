<!-- @format -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { redirectToAuthCodeFlow } from './redirectToAuthCodeFlow';
  import { getAccessToken } from './getAccessToken';
  import { fetchProfile } from './fetchProfile';

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

  const token = localStorage.getItem('token');

  let profile;

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

    profile = await fetchProfile(token);
  });
</script>

<pre>{JSON.stringify(profile)}</pre>
