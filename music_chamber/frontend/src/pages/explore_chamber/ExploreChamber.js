import * as React from 'react';
import * as customSyle from '../../constants/cssStyle';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

//TODO: 
// 1. pagination or load-more button
// 2. update chamber creation parameters and link to real chamber data (for private chamber: no chamber_id is passed)
// 3. maybe language also display as tab
// 4. search function

const imgDemoArray = ['https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb', 
                      'https://i.scdn.co/image/ab67616d0000b2731d72eef7edf0c48c1751d459',
                      'https://i.scdn.co/image/ab67616d00001e02b0e2180e265c919599076578',
                      'https://i.scdn.co/image/ab67616d00001e0275dddb653f0ef9cd2179d41b',
                      'https://i.scdn.co/image/ab67616d0000b2735095b7a6c4b5d9b982e559f3',
                      'https://i.scdn.co/image/ab67616d0000b273ebae64c1debc84504b894148',
                     ]
const playlistCategoryDemo = ['Random', 'R&B', 'Funk', 'Pop', 'Hip Hop', 'Rock', 'Blues', 'Country', 'Jazz']

const createChamberList = () => {
  const randomCatIndexStart = Math.floor(Math.random() * 8)
  const myListIndex =  [...Array(10).keys()]
  const myListItem = myListIndex.map((item, index) => {
    return {id: {index}, chamber_id: `ChamberID${index}`, chamber_name: `Chamber Name ${index}`, 
            host_name: `Host ${index}`, chamber_desc: `Welcome to join this chamber!! this is the chamber ${index}. Listen and enjoy the music with me!`, 
            song_on_play: `Song ${index}`, main_language: `Language ${index}`, 
            guest_nb: Math.floor(Math.random() * 10), guest_nb_max: 10 + Math.floor(Math.random() * 10), 
            song_image_url: imgDemoArray[Math.floor(Math.random() * 6)],
            playlist_catagory: playlistCategoryDemo.slice(randomCatIndexStart, randomCatIndexStart + 1 + Math.floor(Math.random() * 4)),
            is_public: [true, true, true, true, false, false][Math.floor(Math.random() * 6)]
           }
  })

  return myListItem
}
const chamberList = createChamberList()
// const chamberList = [{chamber_id: 'test1', chamber_name: 'Work & Music', host_name: 'host1', 
//                       chamber_desc: 'Feel bored or stress when work by your own? Join my chanel to listen music and work together.', 
//                       song_on_play: 'song1', main_language: 'English', guest_nb: 15, guest_nb_max: 25, 
//                       song_image_url:'https://i.scdn.co/image/ab67616d0000b2735095b7a6c4b5d9b982e559f3',
//                       playlist_catagory:['Jazz', 'Blues', 'Funk'], is_public: true}];
// const chamberList = [{chamber_id: 'test1', chamber_name: 'Study with Me', host_name: 'host1', 
//                       chamber_desc: 'Cannot study without music. If you are also preparing the exam and need some music to chill, join me!', 
//                       song_on_play: 'song1', main_language: 'English', guest_nb: 15, guest_nb_max: 25, 
//                       song_image_url:'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb',
//                       playlist_catagory:['R&B', 'Country'], is_public: false}];


export default function ExploreChamber() {
  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      {/* End hero unit */}
      <Grid container spacing={4}>
        {chamberList.map((chamberData) => (
          <Grid item key={chamberData.id} xs={12} sm={6} md={4}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius:3, background: '#212121' }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: '50%'
                }}
                image={chamberData.song_image_url}
                alt="random"
              />
              <CardContent sx={{ flexGrow: 1, mt: 2}}>
                <Typography gutterBottom variant="h5" component="h2" sx={{color: "primary.main"}}>
                  {chamberData.chamber_name}
                </Typography>
                <Typography>
                  {chamberData.chamber_desc}
                </Typography>


              </CardContent>

              <Box sx={{mt: 2, ml:2}}>
                <Typography sx={{pr: 1, color: "primary.main"}}> Playlist Info: </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                  <Typography sx={{pr: 1}}> Main Language: </Typography>
                  <Typography> {chamberData.main_language} </Typography>
                </Box>

                <Typography sx={{pr: 1}}> Categories: </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', ml:1.5, my:2}}>
                {chamberData.playlist_catagory.map((data, index) => (
                    <Chip key={index} variant="outlined" color="primary" label={data} sx={{mr:1}}/>
                ))}
              </Box>
        


              <CardActions disableSpacing>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Typography sx={{ ml: 1}}>
                    {`Guests: ${chamberData.guest_nb} / ${chamberData.guest_nb_max} `}
                  </Typography>

                  <IconButton aria-label="enter" onClick={()=>{console.log('enter chamber!')}}>
                    {chamberData.is_public ? <MeetingRoomIcon sx={{color:'primary.main'}}/>  : <Typography sx={{ color: 'red'}}>Private</Typography>}
                  </IconButton>
                </Grid>

                
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
