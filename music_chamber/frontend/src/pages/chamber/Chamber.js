import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { useSession } from '../../hooks/useSession';

import SpotifyPlayback from '../../components/SpotifyPlayback'

// styles
import './Chamber.css'

export default function Chamber() {

	const csrftoken = useSession('csrftoken')
  const { id } = useParams()
	const [url, setUrl] = useState('/api/get-chamber?id=' + id)
	const [objChamberInfo, setObjChamberInfo] = useState('')

  const [userAuthStatus, setUserAuthStatus] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  //const [playlistId, setPlaylistId] = useState('')

  const createPlaylist = () => {
    fetch("/api-spotify/create-playlist", {method: "PUT", headers: {'X-CSRFToken': csrftoken}})
      .then(response => response.json())
      .then((data) => {
        //setPlaylistId(data.id);
        //console.log('list_id: ', data.id)
        if (data.id) {
          addSong(data.id)
        }
      })
  }


  const requestOption = (jsonData) =>{
    const optionData = {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: jsonData,
    }
    return optionData
  } 
  
  
  const addSong = (playlistId) => {

    const dataAddSong = {
      playlist_id: playlistId,
      track_uris: "spotify:track:0iLI1bC10ff1qmiwJL680w",
    };
    const jsonAddSong = JSON.stringify(dataAddSong, null, '')

    const dataResumeSong = {
      context_uri: playlistId,
    };
    const jsonResumeSong = JSON.stringify(dataResumeSong, null, '')

    fetch("/api-spotify/playlist-add-item", requestOption(jsonAddSong))
      .then(response => response.json())
      .then((data) => {
        //This need to run  after playback sdk has been setup
        fetch("/api-spotify/resume-playback", requestOption(jsonResumeSong))
      })
  }



  
  
  const loginSpotify = () => {
    fetch("/api-spotify/check-user-auth")
      .then((response) => response.json())
      .then((data) => {
        setUserAuthStatus(data.is_auth)

        if (!data.is_auth) {
          fetch("/api-spotify/get-auth-url")
            .then(response => response.json())
            .then((data) => {
              window.location.replace(data.auth_url)
            })
        } 
        else {
          fetch("/api-spotify/get-access-token")
            .then(response => response.json())
            .then((data) => {
              setAccessToken(data.access_token)
            })
            .then(() => {
              createPlaylist()
            })
            
        }

      })
  }


	useEffect(() => {
		fetch(url)
      .then((response) => response.json())
      .then((data) => setObjChamberInfo(data))
    
      loginSpotify()
	}, [])

  //useEffect(() => console.log(userAuthStatus), [userAuthStatus]);


  return (
    <div>
        <p>Chamber ID: {objChamberInfo ? objChamberInfo.chamber_id : ''}</p>
        <p>Chamber Name: {objChamberInfo ? objChamberInfo.chamber_name : ''}</p>
        <p>Guest Can Pause: {objChamberInfo ? objChamberInfo.access_guest_can_pause.toString() : ''}</p>
        <p>Votes Required to Skip Song: {objChamberInfo ? objChamberInfo.votes_song_skip : ''}</p>
        <p>Chamber Created at: {objChamberInfo ? objChamberInfo.created_at : ''}</p>
        <p>Is Public Chamber: {objChamberInfo ? objChamberInfo.is_public.toString() : ''}</p>
        <p>Are You Host: {objChamberInfo ? objChamberInfo.is_host.toString() : ''}</p>
        <SpotifyPlayback token={accessToken} />
    </div>
  )
}
