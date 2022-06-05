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

  const [playlistId, setPlaylistId] = useState('')
  const [isSdkPlaybackOn, setIsSdkPlaybackOn] = useState(false)

  
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


  const switchSdkPlaybackStatus = (trueOrFalse) => {
    console.log('changing sdk playback status to: ', trueOrFalse)
    setIsSdkPlaybackOn(trueOrFalse)
  };


  const createPlaylist = async () => {
    console.log('start creating playlist...')
    const res = await fetch("/api-spotify/create-playlist", {method: "PUT", headers: {'X-CSRFToken': csrftoken}})
    const data = await res.json()
    setPlaylistId(data.id)
    console.log('playlist created. playlist_id:', data.id)
  }


  const addSong = async () => {
    console.log('start adding song. song id: ', playlistId)

    if (playlistId) {
      const dataAddSong = {
        playlist_id: playlistId,
        track_uris: "spotify:track:0iLI1bC10ff1qmiwJL680w, spotify:track:4vVOuveXRA5P41lEbZfoBH, spotify:track:04DYiSKmP437iS9t48loby",
      };
      const jsonAddSong = JSON.stringify(dataAddSong, null, '')

      const res = await fetch("/api-spotify/playlist-add-item", requestOption(jsonAddSong))
      const data = await res.json()

      console.log("song added. add_song_sanp: ", data)

    }

  }

  const resumePlayback = async () => {
    console.log('start resume song. palylist id: ', playlistId)
    // const dataResumeSong = {
    //   context_uri: playlistId,
    // };
    // const jsonResumeSong = JSON.stringify(dataResumeSong, null, '')

    const res = await fetch("/api-spotify/resume-playback", requestOption(''))
    const data = await res.json()
    console.log('song resumed. details: ', data)
  }



  const loginSpotify = async () => {
    const res_check_user_auth = await fetch("/api-spotify/check-user-auth")
    const data_check_user_auth = await res_check_user_auth.json()
    setUserAuthStatus(data_check_user_auth.is_auth)

    if (!data_check_user_auth.is_auth) {
      const res_get_auth_url = await fetch("/api-spotify/get-auth-url")
      const data_get_auth_url = await res_get_auth_url.json()
      window.location.replace(data_get_auth_url.auth_url)
    } else {
      const res_get_access_token = await fetch("/api-spotify/get-access-token")
      const data_get_access_token = await res_get_access_token.json()
      setAccessToken(data_get_access_token.access_token)
    }
  }


	useEffect(async () => {
		const res_get_chamber = await fetch(url)
    const data_get_chamber = await res_get_chamber.json()
    setObjChamberInfo(data_get_chamber)
    loginSpotify()
	}, [])


  useEffect(() => {
    console.log('check room issdkstatus: ', isSdkPlaybackOn)
    if (isSdkPlaybackOn && objChamberInfo.is_host) {
      console.log('creatPlaylist function start...')
      createPlaylist()
    } else if (isSdkPlaybackOn && !objChamberInfo.is_host) {
      console.log('guest start resumePlayback function...')
      resumePlayback()
    }
  }, [isSdkPlaybackOn])


  useEffect( async () => {
    if (playlistId && objChamberInfo.is_host) {
      console.log('addSong function start...')
      await addSong()
      console.log('resumePlayback function start...')
      await resumePlayback()
    }
  }, [playlistId])


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
        <SpotifyPlayback token={accessToken} switchSdkPlaybackStatus={switchSdkPlaybackStatus} />
    </div>
  )
}
