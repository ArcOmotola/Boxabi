const clientId = '6f4d4394326e49fc86d211dda5d10a92';
const redirectUri = 'http://omo_t_quantum.surge.sh';

let accessToken; 

const Spotify = {
  getAccessToken() {
      if (accessToken) {
          return accessToken;
      }

      //check for access token match

      const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

      if (accessTokenMatch && expiresInMatch) {
          accessToken = accessTokenMatch[1];
          const expiresIn = Number(expiresInMatch[1]);

          //this clears the parameters, allowing us to grab a new access token when it expires

          window.setTimeout(() => accessToken = '', expiresIn * 1000);
          window.history.pushState('Access Token', null, '/');
          return accessToken;
     
        }else{
         const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
         window.location = accessUrl;
      }

  },


  search(term) {
    const accessToken = Spotify.getAccessToken();
      return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        if (!jsonResponse.tracks) {
        return [];
      }
      console.log(jsonResponse.tracks);
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images[2].url,
        preview: track.preview_url,
        uri: track.uri
      }));
     });
   },


  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length){
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers =  {Authorization: `Bearer ${accessToken}`};
    let userId;

    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
      {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
      }).then(response => response.json()
      ).then(jsonResponse => {
        const PlaylistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${PlaylistId}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({ uris: trackUris }),
        })
      })
    })
  } 

}

export default Spotify;