import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { useSession } from '../../hooks/useSession';
import { Box } from '@mui/material'

import SpotifyPlayback from '../../components/SpotifyPlayback'
import AddSong from '../../components/AddSong'
import MusicPlayer from '../../components/MusicPlayer'

// styles
import './Chamber.css'

const song_info = {
  song_name:'Those Eyes', song_singer:'New West', durationInMs:180000, song_energy:0.842, 
  song_danceability:0.842, song_happiness:0.842, song_acousticness:0.142,
  song_speechiness:0.0556, song_popularity:72, song_tempo:118.211
}

export default function Chamber() {

	const csrftoken = useSession('csrftoken')
  const { id } = useParams()
	const [url, setUrl] = useState('/api/get-chamber?id=' + id)
	const [objChamberInfo, setObjChamberInfo] = useState('')

  const [userAuthStatus, setUserAuthStatus] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  const [playlistId, setPlaylistId] = useState('')
  const [isSdkPlaybackOn, setIsSdkPlaybackOn] = useState(false)

  const [openAddSong, setOpenAddSong] = useState(false);
  const [songIdsToBeAdded, setSongIdsToBeAdded] = useState([]);

  const [openMusicPlayer, setOpenMusicPlayer] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSkip, setIsSkip] = useState(false);
  
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

  const switchOpenAddSong = (trueOrFalse) => {
    setOpenAddSong(trueOrFalse)
  };

  const updateSongIdsToBeAdded = (arraySongId) => {
    setSongIdsToBeAdded(arraySongId)
  };


  const togglePlay = () => { if (isPlay) {setIsPlay(false)} else {setIsPlay(true)} }
  const toggleFavorite = () => { if (isFavorite) {setIsFavorite(false)} else {setIsFavorite(true)} }
  const toggleSkip = () => { if (isSkip) {setIsSkip(false)} else {setIsSkip(true)} }


  const createPlaylist = async () => {
    console.log('start creating playlist...')
    const res = await fetch("/api-spotify/create-playlist", {method: "PUT", headers: {'X-CSRFToken': csrftoken}})
    const data = await res.json()
    setPlaylistId(data.id)
    console.log('playlist created. playlist_id:', data.id)
  }


  const addSong = async () => {
    console.log('start adding song. song id: ', playlistId)

    if (playlistId && songIdsToBeAdded.length>0) {
      const dataAddSong = {
        playlist_id: playlistId,
        track_id: songIdsToBeAdded.join(","),
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
    // get chamber info and login spotify
		const res_get_chamber = await fetch(url)
    const data_get_chamber = await res_get_chamber.json()
    setObjChamberInfo(data_get_chamber)
    loginSpotify()
	}, [])


  useEffect(() => {
    // create playlist (for host) or directly play song (for guest) after sdk playback is created
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
    // show add song ui after playlist is created
    if (playlistId && objChamberInfo.is_host) {
      switchOpenAddSong(true)
    }
  }, [playlistId])


  useEffect( async () => {
    // add songs to system after user has selected his/her song
    if (songIdsToBeAdded.length>0) {
      console.log('I am going to add the song')
      await addSong()
      setOpenMusicPlayer(true)
    }
  }, [songIdsToBeAdded])


  useEffect( async () => {
    // start play song once host has finished the add song process
    if (openMusicPlayer) {
      await resumePlayback()
      setIsPlay(true)
    } 
  }, [openMusicPlayer])




  //useEffect(() => console.log(userAuthStatus), [userAuthStatus]);


  return (
    <div>
        {/* <p>Chamber ID: {objChamberInfo ? objChamberInfo.chamber_id : ''}</p>
        <p>Chamber Name: {objChamberInfo ? objChamberInfo.chamber_name : ''}</p>
        <p>Guest Can Pause: {objChamberInfo ? objChamberInfo.access_guest_can_pause.toString() : ''}</p>
        <p>Votes Required to Skip Song: {objChamberInfo ? objChamberInfo.votes_song_skip : ''}</p>
        <p>Chamber Created at: {objChamberInfo ? objChamberInfo.created_at : ''}</p>
        <p>Is Public Chamber: {objChamberInfo ? objChamberInfo.is_public.toString() : ''}</p>
        <p>Are You Host: {objChamberInfo ? objChamberInfo.is_host.toString() : ''}</p> */}
        <SpotifyPlayback token={accessToken} switchSdkPlaybackStatus={switchSdkPlaybackStatus} />
        <AddSong openAddSong={openAddSong} switchOpenAddSong={switchOpenAddSong} updateSongIdsToBeAdded={updateSongIdsToBeAdded}/>
        {
          openMusicPlayer && <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: "center",
            alignItems: 'center', minHeight: '100vh',
          }}>
            <MusicPlayer {...song_info} isPlay={isPlay} togglePlay={togglePlay} 
                         isFavorite={isFavorite} toggleFavorite={toggleFavorite} isSkip={isSkip} toggleSkip={toggleSkip}/>
          </Box>
        }
        
    </div>
  )
}
