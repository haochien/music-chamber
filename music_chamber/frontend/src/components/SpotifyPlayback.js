import React, { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';

export default function SpotifyPlayback({ token, switchSdkPlaybackStatus, switchSongHasChangedStatus}) {
  
  const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}
  
  const user_token = token
  const csrftoken = useSession('csrftoken')
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);
  const [currentSongID, setCurrentSongID] = useState('');
  const [deviceSwitchStatus, setIsDeviceSwitchStatus] = useState(false);
  
  const switchDevice = () => {
    fetch("/api-spotify/transfer-device", {method: "PUT", headers: {'X-CSRFToken': csrftoken}})
      .then((response) => {
        if(response.ok) {
          setIsDeviceSwitchStatus(response)
          switchSdkPlaybackStatus(true)
        }
        
      })
  }
  //useEffect(() => console.log(deviceSwitchStatus), [deviceSwitchStatus]);


  useEffect(() => {
    if (user_token) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {

          const player = new window.Spotify.Player({
              name: 'Music-Chamber',
              getOAuthToken: cb => { cb(user_token); },
              volume: 0.5
          });

          setPlayer(player);

          player.addListener('ready', ({ device_id }) => {
              console.log('Ready with Device ID', device_id);
              switchDevice();

              // switch song play from any spotify client to the current chamber
              // const connect_to_device = () => {
              //   console.log("Changing to device");
              //   let change_device = fetch("https://api.spotify.com/v1/me/player", {
              //     method: "PUT",
              //     body: JSON.stringify({
              //       device_ids: [device_id],
              //       play: false,
              //     }),
              //     headers: new Headers({
              //       Authorization: "Bearer " + user_token,
              //     }),
              //   }).then((response) => console.log(response));
              // };
              // connect_to_device();
          });

          player.addListener('not_ready', ({ device_id }) => {
              console.log('Device ID has gone offline', device_id);
          });

          player.addListener('initialization_error', ({ message }) => { 
            console.error('Failed to initialize: ', message);
          });
      
          player.addListener('authentication_error', ({ message }) => {
              console.error('Failed to authenticate: ', message);
          });
      
          player.addListener('account_error', ({ message }) => {
              console.error('Failed to validate Spotify account: ', message);
          });

          player.addListener('player_state_changed', ( state => {
            if (!state) {
                setActive(false)
                console.log("player active state turn false.")
                return;
            }
        
            setActive(true) 
            setTrack(state.track_window.current_track);
            setPaused(state.paused);
            //console.log(state)
            //console.log('### Player SDK: current paused status: ', state.paused)
            //console.log('### Player SDK: current song: ', state.track_window.current_track)
            
            if (state.paused === false && currentSongID === '') {
              //console.log('### Player SDK: setCurrentSongID to', state.track_window.current_track.name)
              setCurrentSongID(state.track_window.current_track.id)
            }

            if (state.paused === false && state.track_window.current_track.id !== currentSongID) {
              //console.log('### Player SDK: switchSongHasChangedStatus to true')
              switchSongHasChangedStatus(true)
            }

            // player.getCurrentState().then( state => { 
            //     (!state) ? setActive(false) : setActive(true) 
            //     var current_track = state.track_window.current_track;
            //     var next_track = state.track_window.next_tracks[0];
            // });

            //   console.log('Position in Song', position);
            //   console.log('Duration of Song', duration);
        
          }));


          player.connect().then((success) => {
            if (success) {
              //console.log("The Web Playback SDK successfully connected to Spotify!");
            }
          });

      };
    } 

    
  }, [user_token]);

  

  return (
    <>
      <div className="container">
          {/* <div className="main-wrapper">

            <img src={current_track.album.images[0].url} 
                     className="now-playing__cover" alt="" />

            <div className="now-playing__side">
                <div className="now-playing__name">{
                              current_track.name
                              }</div>

                <div className="now-playing__artist">{
                              current_track.artists[0].name
                              }</div>
            </div>

            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                  &lt;&lt;
            </button>

            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                { is_paused ? "PLAY" : "PAUSE" }
            </button>

            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                  &gt;&gt;
            </button>

          </div> */}
      </div>
    </>
  )
}
