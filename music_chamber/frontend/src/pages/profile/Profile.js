import {useEffect, useState, Fragment} from 'react';
import img_profile_banner_demo from '../../static/profile_banner/img_profile_banner_demo.jpg'
import img_avatar_demo from '../../static/profile_avatar/img_avatar_demo.jpg'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import GroupsIcon from '@mui/icons-material/Groups';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';


const profileList = [{id: 'overview', name: 'Overview', icon:<HomeIcon />}, 
                     {id: 'profile', name: 'Profile', icon:<PersonIcon />},
                     {id: 'playlist', name: 'Playlists', icon:<QueueMusicIcon />}, 
                     {id: 'followers', name: 'Followers', icon:<GroupsIcon />}, 
                     {id: 'following', name: 'Following', icon:<RecentActorsIcon />},
                     {id: 'chamber_history', name: 'Chamber History', icon:<HistoryIcon />},
                     {id: 'setting', name: 'Setting', icon:<SettingsIcon />},
                    ]

const userData = {spotify_id: 'testId1', display_name: 'Hao Hsueh', images: '', 
                  favorite_music_type: ['Funk', 'R&B', 'Blues'], favorite_music_language: ['Mandarin', 'English', 'Spanish']}

export default function Profile() {
  const [selectedItem, setSelectedItem] = useState(0);

  const profileNavList = () => (
      <List>
        {profileList.map((item, indexItem) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton 
              selected={selectedItem === indexItem}
              onClick={(event) => {setSelectedItem(indexItem)}}
            >
              <ListItemIcon sx={{color:'white'}}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
  );

  const profile_overview = () => (
    <Box>
      <Box
        component="img"
        sx={{
          width: '100%', height: 250, objectFit: 'cover'
        }}
        alt="Profile_Demo"
        src={img_profile_banner_demo}
      />


      <Box sx={{position:'relative', top:-55, px:3}}>
        <Box sx={{display:'inline-flex', alignItems:"center", width:'100%', justifyContent: 'space-between', zIndex:1}}>

          <Box key="social-media-icons" sx={{display:'flex', alignItems:"center"}}>
            <Avatar alt="" src={img_avatar_demo} sx={{display:'inline-table', height: '7em', width: '7em', border: '10px solid #212121' }}/>
            <Typography variant="h3" color="white" component="div" align='left' sx={{fontSize: 30, pl:1}}>
              Hao Hao
            </Typography>
          </Box>

          <Box sx={{display:'flex', gap:1}}>
            <IconButton aria-label="facebook">
              <FacebookIcon sx={{color:"primary.main", fontSize:30}}/>
            </IconButton>
            <IconButton aria-label="instagram">
              <InstagramIcon sx={{color:"primary.main", fontSize:30}}/>
            </IconButton>
            <IconButton aria-label="twitter">
              <TwitterIcon sx={{color:"primary.main", fontSize:30}}/>
            </IconButton>
          </Box>
          
        </Box>  


        {/* <Box sx={{maxWidth:'70%', mt:2}}>
          <Typography variant="h4" color="white" component="div" align='left' sx={{fontSize: 15}}>
            I want to enjoy every moment I worked. Working can be also very chill and elegant when listen the music with you all.
          </Typography>
        </Box> */}

        <Grid container spacing={3} justifyContent="space-between" alignItems="stretch" sx={{mt:0}}>
          <Grid item xs={12} md={8}>
          
            <Stack spacing={5} alignItems="felx-start" justifyContent="space-between" sx={{height:'100%'}}>
              <Typography variant="h4" color="white" component="div" align='left' sx={{fontSize: 15}}>
                I want to enjoy every moment I worked. Working can be also very chill and elegant when listen the music with you all.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" color="primary.main" component="div" align='left' sx={{fontSize: 15}}>
                    Current Satus: 
                  </Typography>

                  <Typography variant="h4" color="white" component="div" align='left' sx={{fontSize: 15, mt:1}}>
                    {`In The Chamber - ${'Listen Jazz'} ${'(Private)'}`}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h4" color="primary.main" component="div" align='left' sx={{fontSize: 15}}>
                    Favorte Music Type: 
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt:1}}>
                  {userData.favorite_music_type.map((data, index) => (
                      <Chip key={index} variant="outlined" label={data} sx={{mr:2, color:'white'}}/>
                  ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h4" color="primary.main" component="div" align='left' sx={{fontSize: 15}}>
                    Favorte Music Language: 
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt:1}}>
                  {userData.favorite_music_language.map((data, index) => (
                      <Chip key={index} variant="outlined" label={data} sx={{mr:2, color:'white'}}/>
                  ))}
                  </Box>
                </Box>
              </Stack>


              <Button variant="contained" color="primary" sx={{borderWidth:2, width:'20%'}} onClick={() => {console.log('Followed!!')}}  >
                {`Follow`}
              </Button>
            </Stack>

          </Grid>




          <Grid item xs={12} md={4}>
            <Stack spacing={1} sx={{border: '2px solid white', borderRadius:2, minHeight:350, py:2, height:'100%'}}>
              <Box>
                <Typography variant="h4" color="primary.main" component="div" align='center' sx={{fontSize: 20}}>
                  Chambers Created
                </Typography>
                <Typography color="#ec407a" component="div" align='center' sx={{fontSize: 50}}>12</Typography>
              </Box>

              <Box>
                <Typography variant="h4" color="primary.main" component="div" align='center' sx={{fontSize: 20}}>
                  Cumulative Audiences
                </Typography>
                <Typography color="#ec407a" component="div" align='center' sx={{fontSize: 50}}>256</Typography>
              </Box>

              <Box>
                <Typography variant="h4" color="primary.main" component="div" align='center' sx={{fontSize: 20}}>
                  Followers
                </Typography>
                <Typography color="#ec407a" component="div" align='center' sx={{fontSize: 50}}>98</Typography>
              </Box>

            </Stack>
          </Grid>
        </Grid>







      </Box>
      

    </Box>    

      



  );



  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
    <Grid container spacing={3} direction="row" alignItems="stretch" justifyContent="flex-start">

      <Grid item xs={3}>
        <Box sx={{ minHeight:750, height:'100%', width: '100%', background:'#212121', color:'white' }}>
          {profileNavList()}
        </Box>
      </Grid>

      <Grid item xs={9} >
        <Box sx={{background: '#212121', minHeight: 750, height:'100%', minWidth:'100%'}}>
          {profile_overview()}
        </Box>
      </Grid>

    </Grid>
    </Container>



    // <Box>
    //   {profileNavList()}
    // </Box>
    
  )
}
