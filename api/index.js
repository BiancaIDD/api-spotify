import dotenv from 'dotenv';
import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import cors from 'cords'

dotenv.config();

const api = express();
api.use(
  cors({origin: true})
)

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
});

const setAccessToken = async () => {
  const tokenData = await spotifyApi.refreshAccessToken();
  spotifyApi.setAccessToken(tokenData.body['access_token']);
};

const getRecentTrack = async () => {
  const response = await spotifyApi.getMyRecentlyPlayedTracks({
    limit: 1,
  });

  const lastTrack = response.body.items[0].track;
  const trackInfo = {
    spotify_link: lastTrack.external_urls.spotify,
    artist: lastTrack.artists[0].name,
    track: lastTrack.name,
    album: {
      name: lastTrack.album.name,
      image: lastTrack.album.images[1].url,
    },
  };

  return trackInfo;
};

const getCurrentTrack = async () => {
  const response = await spotifyApi.getMyCurrentPlayingTrack();

  if (Object.keys(response.body).length !== 0) {
    const currentTrack = response.body.item;
    const trackInfo = {
      spotify_link: currentTrack.external_urls.spotify,
      artist: currentTrack.artists[0].name,
      track: currentTrack.name,
      album: {
        name: currentTrack.album.name,
        image: currentTrack.album.images[1].url,
      },
    };

    return trackInfo;
  }

  return undefined;
};

api.get('/', (req, res) => {
  res.json({ message: 'Server is up!' });
});

api.get('/track', async (req, res) => {
  await setAccessToken();
  let trackInfo = await getCurrentTrack();
  if (trackInfo === undefined) {
    trackInfo = await getRecentTrack();
  }

  res.json(trackInfo);
});

api.listen(process.env.PORT, () => {
  console.log('Hey, the api is ready');
});
