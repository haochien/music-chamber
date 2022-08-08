import {useEffect, useState, Fragment} from 'react'
import ChamberDrawer from '../../components/ChamberDrawer'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'

import { useSession } from '../../hooks/useSession';
import SpotifyPlayback from '../../components/SpotifyPlayback'
import AddSong from '../../components/AddSong'
import MusicPlayer from '../../components/MusicPlayer'
import Playlist from '../../components/Playlist'
import MemberList from '../../components/MemberList'
import LoginBox from '../../components/LoginBox'
import { checkIsAuth, getSpotifyAccessToken } from '../../middlewares/auth';

// styles
import './Chamber.css'

// const songInfo = {
//   song_name:'Those Eyes', song_singer:'New West', durationInMs:180000, song_energy:0.842, 
//   song_danceability:0.842, song_happiness:0.842, song_acousticness:0.142,
//   song_speechiness:0.0556, song_popularity:72, song_tempo:118.211, song_image_url:'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb'
// }

export default function Chamber() {

	const csrftoken = useSession('csrftoken')
  const { id } = useParams()
	const [url, setUrl] = useState('/api/get-chamber?id=' + id)
	const [objChamberInfo, setObjChamberInfo] = useState('')

  const [playlistId, setPlaylistId] = useState('')
  const [isSdkPlaybackOn, setIsSdkPlaybackOn] = useState(false)
  const [songHasChanged, setSongHasChanged] = useState(false)

  const [openAddSong, setOpenAddSong] = useState(false);
  const [songIdsToBeAdded, setSongIdsToBeAdded] = useState([]);

  const [openMusicPlayer, setOpenMusicPlayer] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSkip, setIsSkip] = useState(false);
  const [isChamberStartPlay, setIsChamberStartPlay] = useState(false);

  const [songInfo, setSongInfo] = useState({})
  const [playlistItems, setPlaylistItems] = useState([])

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('player')

  const [openLogin, setOpenLogin] = useState(false);
  const [isAuth, setIsAuth] = useState(false)
  const [accessToken, setAccessToken] = useState('')
  
  const requestOption = (jsonData, requestType) =>{
    const optionData = {
      method: requestType,
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

  const switchSongHasChangedStatus = (trueOrFalse) => {
    console.log('changing setSongHasChanged status to: ', trueOrFalse)
    setSongHasChanged(trueOrFalse)
  };

  const switchOpenAddSong = (trueOrFalse) => {
    setOpenAddSong(trueOrFalse)
  };

  const updateSongIdsToBeAdded = (arraySongId) => {
    setSongIdsToBeAdded(arraySongId)
  };

  const switchOpenLogin = (trueOrFalse) => {setOpenLogin(trueOrFalse)};

  const togglePlay = () => {
    if (isChamberStartPlay) {
      if (isPlay) {setIsPlay(false)} else {setIsPlay(true)}
    } else {
      if (objChamberInfo.is_host) {
        resumePlayback("", 0, 0)
      }  else {
        //TODO: change here to MsgBar
        console.log('The host does not start to play music yet. Please wait for a while.')
      }
    }
    
  } 
  const toggleFavorite = () => { if (isFavorite) {setIsFavorite(false)} else {setIsFavorite(true)} }
  const toggleSkip = () => { if (isSkip) {setIsSkip(false)} else {setIsSkip(true)} }

  const switchIsDrawerOpen = () => { if (isDrawerOpen) {setIsDrawerOpen(false)} else {setIsDrawerOpen(true)} }
  const switchSelectedComponent = (seletion) => {setSelectedComponent(seletion)}


  const createPlaylist = async () => {
    console.log('start creating playlist...')
    const res = await fetch("/api-spotify/create-playlist", {method: "POST", headers: {'X-CSRFToken': csrftoken}})
    const data = await res.json()
    setPlaylistId(data.id)
    console.log('playlist created. playlist_id:', data.id)
  }


  const addSong = async () => {
    console.log('start adding song. playlist id: ', playlistId)

    if (playlistId && songIdsToBeAdded.length>0) {
      const dataAddSong = {
        playlist_id: playlistId,
        track_id: songIdsToBeAdded.join(","),
      };
      const jsonAddSong = JSON.stringify(dataAddSong, null, '')

      const res = await fetch("/api-spotify/playlist-add-item", requestOption(jsonAddSong, 'POST'))
      const data = await res.json()

      console.log("song added. add_song_sanp: ", data)

    }

  }


  const getSongIngoById = async (song_id) => {
    console.log('start get song info by id. song id: ', song_id)
    const res = await fetch('/api-spotify/get-song-info?song_id=' + song_id)
    const data = await res.json()
    console.log("end get song info by id. song info: ", data)

    setSongInfo(data)
  }

  const getPlaylistItems = async (playlist_id) => {
    console.log('start get playlist items. playlist id: ', playlist_id)
    const res = await fetch('/api-spotify/get-playlist-items-all?playlist_id=' + playlist_id)
    const data = await res.json()
    console.log("end get playlist items. playlist items: ", data)

    setPlaylistItems(data)
  }


  const resumePlayback = async (songID, songPosition, positionMs) => {
    console.log('start resume song. palylist id: ', playlistId)
    const dataResumeSong = {
      playlist_id: "",
      offset_by_song_id: songID,
      offset_by_song_position:songPosition,
      position_ms: positionMs,
    };
    const jsonResumeSong = JSON.stringify(dataResumeSong, null, '')
    console.log('jsonResumeSong: ', jsonResumeSong)

    const res = await fetch("/api-spotify/resume-playback", requestOption(jsonResumeSong, 'PUT'))
    const data = await res.json()
    if (!res.ok) {
      console.log('error in res of resumePlayback!!!')
      throw new Error(res.statusText)
    } else {
      setIsChamberStartPlay(true)
      setIsPlay(true)
    }

    console.log('song resumed. data: ', data)
    
  }


  const getSongOnPlay = async () => {
    console.log('start get current song...')
    const res = await fetch('/api-spotify/get-song-on-play')
    const data = await res.json()
    console.log("end get current song. song info: ", data)

    if (data.is_playing) {
      //only update song on play info when this song is on play (to prevent first non-play song)
      setSongInfo(data)
    }
    
  }


  useEffect(async () => {
    // get chamber info
		const res_get_chamber = await fetch(url)
    const data_get_chamber = await res_get_chamber.json()
    setObjChamberInfo(data_get_chamber)
	}, [])


  useEffect(async () => {
    // login spotify
    const isUserAuth = await checkIsAuth()
    setIsAuth(isUserAuth)
    if (!isUserAuth) {
      setOpenLogin(true)
    } else {
      const spotifyAccessToken = await getSpotifyAccessToken()
      setAccessToken(spotifyAccessToken)
      console.log('access_token: ', spotifyAccessToken)
    }

  }, [isAuth])


  useEffect(() => {
    // create playlist (for host) or directly play song (for guest) after sdk playback is created
    console.log('check room issdkstatus: ', isSdkPlaybackOn)
    if (isSdkPlaybackOn && objChamberInfo.is_host) {
      console.log('creatPlaylist function start...')
      createPlaylist()
    } else if (isSdkPlaybackOn && !objChamberInfo.is_host) {
      console.log('guest start resumePlayback function...')
      //TODO: update resumePlayback function for guest
      //resumePlayback()
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
      await getPlaylistItems(playlistId)

      if (!openMusicPlayer) {
        await getSongIngoById(songIdsToBeAdded[0])
        setOpenMusicPlayer(true)
      }
      
    }
  }, [songIdsToBeAdded])


  useEffect( async () => {
    // fetch current song info when song change
    if (songHasChanged) {
      console.log('Song has changed. Fetching current song info...')
      await getSongOnPlay()
      setSongHasChanged(false)
    }
  }, [songHasChanged])


  useEffect(() => {
    if (selectedComponent === "addSong") {
      switchOpenAddSong(true)
    }
  }, [selectedComponent])

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

        <LoginBox openLogin={openLogin} switchOpenLogin={switchOpenLogin} isBackDropAllowed={false} />

        <SpotifyPlayback token={accessToken} switchSdkPlaybackStatus={switchSdkPlaybackStatus}
          switchSongHasChangedStatus={switchSongHasChangedStatus}/>

        <AddSong token={accessToken} openAddSong={openAddSong} switchOpenAddSong={switchOpenAddSong} updateSongIdsToBeAdded={updateSongIdsToBeAdded} 
                 songIdsToBeAdded={songIdsToBeAdded}  switchSelectedComponent={switchSelectedComponent}/>
        
        <Fragment>
        {
          openMusicPlayer && (selectedComponent === 'player') && <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: "center",
            alignItems: 'center', minHeight: '85vh',
            mx: '20px', mb:'50px', mt:'20px'
          }}>
            <MusicPlayer {...songInfo} isPlay={isPlay} togglePlay={togglePlay} 
                         isFavorite={isFavorite} toggleFavorite={toggleFavorite} isSkip={isSkip} toggleSkip={toggleSkip} 
                         isChamberStartPlay={isChamberStartPlay} switchIsDrawerOpen={switchIsDrawerOpen}/>
          </Box>
        }


        {openMusicPlayer && (selectedComponent === 'playlist' || selectedComponent === 'addSong') &&
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: 'center',
            minHeight: '85vh',
            mx: '20px', mb:'50px', mt:'20px'
          }}>
            <Playlist switchIsDrawerOpen={switchIsDrawerOpen} songList={playlistItems} currentSongID={songInfo.id}/>
          </Box>
        }


        {(selectedComponent === 'members') &&
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: 'center',
            minHeight: '85vh',
            mx: '20px', mb:'50px', mt:'20px'
          }}>
            <MemberList switchIsDrawerOpen={switchIsDrawerOpen}/>
          </Box>
        }


        {/* // TODO: remove this part after all component ui are ready */}
        {openMusicPlayer && (selectedComponent === 'chatRoom') &&
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: 'center',
            minHeight: '85vh',
            mx: '20px', mb:'50px', mt:'20px'
          }}>
            <MusicPlayer {...songInfo} isPlay={isPlay} togglePlay={togglePlay} 
                         isFavorite={isFavorite} toggleFavorite={toggleFavorite} isSkip={isSkip} toggleSkip={toggleSkip} 
                         isChamberStartPlay={isChamberStartPlay} switchIsDrawerOpen={switchIsDrawerOpen}/>
          </Box>
        }

        <ChamberDrawer anchor='right' isDrawerOpen={isDrawerOpen} switchIsDrawerOpen={switchIsDrawerOpen} switchSelectedComponent={switchSelectedComponent}/>
        </Fragment>
        
    </div>
  )
}
