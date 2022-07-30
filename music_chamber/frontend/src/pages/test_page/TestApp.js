import {useEffect, useState, Fragment} from 'react'
import ChamberDrawer from '../../components/ChamberDrawer'
import { Box } from '@mui/material'
import AddSong from '../../components/AddSong'
import TestPage from './TestPage'
import TestPage2 from './TestPage2'
import TestPage3 from './TestPage3'
import TestPage4 from './TestPage4'

export default function TestApp() {

  const song_info = {
    song_name:'Those Eyes', song_singer:'New West', durationInMs:180000, song_energy:0.842, 
    song_danceability:0.842, song_happiness:0.842, song_acousticness:0.142,
    song_speechiness:0.0556, song_popularity:72, song_tempo:118.211, song_image_url:'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb'
  }
                     
  const [isPlay, setIsPlay] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSkip, setIsSkip] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('player')

  const togglePlay = () => { if (isPlay) {setIsPlay(false)} else {setIsPlay(true)} }
  const toggleFavorite = () => { if (isFavorite) {setIsFavorite(false)} else {setIsFavorite(true)} }
  const toggleSkip = () => { if (isSkip) {setIsSkip(false)} else {setIsSkip(true)} }

  const switchIsDrawerOpen = () => {if (isDrawerOpen) {setIsDrawerOpen(false)} else {setIsDrawerOpen(true)}} 
  const switchSelectedComponent = (seletion) => {setSelectedComponent(seletion)}

  const [openAddSong, setOpenAddSong] = useState(false);
  const [songIdsToBeAdded, setSongIdsToBeAdded] = useState([]);
  const switchOpenAddSong = (trueOrFalse) => {
    setOpenAddSong(trueOrFalse)
  };
  const updateSongIdsToBeAdded = (arraySongId) => {
    setSongIdsToBeAdded(arraySongId)
  };
  const accessToken = 'test'

  useEffect(() => {
    if (selectedComponent === "addSong") {
      switchOpenAddSong(true)
    }
  }, [selectedComponent])


  return (
    <Fragment>
    <TestPage4 token={accessToken} openAddSong={openAddSong} switchOpenAddSong={switchOpenAddSong}/>
    {(selectedComponent === 'player') &&
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
        minHeight: '85vh',
        mx: '20px', mb:'50px', mt:'20px'
      }}>
        <TestPage {...song_info} isPlay={isPlay} togglePlay={togglePlay} isFavorite={isFavorite} toggleFavorite={toggleFavorite} isSkip={isSkip} toggleSkip={toggleSkip} switchIsDrawerOpen={switchIsDrawerOpen}/>
      </Box>
    }

    {(selectedComponent === 'playlist' || selectedComponent === 'addSong' ) &&
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
        minHeight: '85vh',
        mx: '20px', mb:'50px', mt:'20px'
      }}>
        <TestPage2 switchIsDrawerOpen={switchIsDrawerOpen}/>
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
        <TestPage3 switchIsDrawerOpen={switchIsDrawerOpen}/>
      </Box>
    }

    {/* // TODO: remove this part after all component ui are ready */}
    {(selectedComponent === 'chatRoom') &&
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
        minHeight: '85vh',
        mx: '20px', mb:'50px', mt:'20px'
      }}>
        <TestPage {...song_info} isPlay={isPlay} togglePlay={togglePlay} isFavorite={isFavorite} toggleFavorite={toggleFavorite} isSkip={isSkip} toggleSkip={toggleSkip} switchIsDrawerOpen={switchIsDrawerOpen}/>
      </Box>
    }
    
    <ChamberDrawer anchor='right' isDrawerOpen={isDrawerOpen} switchIsDrawerOpen={switchIsDrawerOpen} switchSelectedComponent={switchSelectedComponent}/>
    </Fragment>
    
      
  )
}
