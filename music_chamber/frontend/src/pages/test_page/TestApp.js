import {useEffect, useState} from 'react'
import { Box } from '@mui/material'
import React from 'react'
import TestPage from './TestPage'

export default function TestApp() {

  const song_info = {
    song_name:'Those Eyes', song_singer:'New West', durationInMs:180000, song_energy:0.842, 
    song_danceability:0.842, song_happiness:0.842, song_acousticness:0.142,
    song_speechiness:0.0556, song_popularity:72, song_tempo:118.211, song_image_url:'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb'
  }
                     
  const [isPlay, setIsPlay] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSkip, setIsSkip] = useState(false);

  const togglePlay = () => { if (isPlay) {setIsPlay(false)} else {setIsPlay(true)} }
  const toggleFavorite = () => { if (isFavorite) {setIsFavorite(false)} else {setIsFavorite(true)} }
  const toggleSkip = () => { if (isSkip) {setIsSkip(false)} else {setIsSkip(true)} }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: "center",
      alignItems: 'center',
      minHeight: '85vh',
      mx: '20px', mb:'50px', mt:'20px'
    }}>
      <TestPage {...song_info} isPlay={isPlay} togglePlay={togglePlay} isFavorite={isFavorite} toggleFavorite={toggleFavorite} isSkip={isSkip} toggleSkip={toggleSkip}/>
    </Box>
      
  )
}
