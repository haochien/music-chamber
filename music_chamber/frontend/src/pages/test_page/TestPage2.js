import {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import * as customSyle from '../../constants/cssStyle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';


const currentSongID = 'test2'
const songList2 = [{song_name:'song 1', song_singer:'artist 1', song_image_url: 'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb'}, 
                  {song_name:'song 2', song_singer:'artist 2', song_image_url: 'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb'},
                  {song_name:'song 3', song_singer:'artist 3', song_image_url: 'https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb'}]

const createSongList = () => {
  const myListIndex =  [...Array(100).keys()]
  const myListItem = myListIndex.map((item, index) => {
    return {id: `test${index}`, song_name: `song ${item}`, song_singer: `artist ${item}`, song_image_url: `https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb`}
  })

  return myListItem
}
const songList = createSongList()



const CustomizedListItem = ({ event, listItemId, labelId, expandId, nbSkip, nbUpvote }) => {
  const [ listExpandopen, setListExpandopen ] = useState(false)
  const handleListExpand = (event) => {setListExpandopen(!listExpandopen)}

  return(
    <div>
      {/* {index>0 ? <Divider key={dividerId}/> : null} */}

      <ListItem 
        key={listItemId}
        button
        onClick={handleListExpand}
        secondaryAction={
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {
              (nbUpvote >= nbSkip) && !(nbSkip===0 && nbUpvote===0) &&
              <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Typography variant="h6" component="div" align='left' sx={{fontSize: 18, mr:0.5, color:'primary.main'}}> {nbUpvote} </Typography>
              <ThumbUpAltOutlinedIcon fontSize="small" sx={{mr:1, pb:0.2, color:'primary.main'}}/>
              </Box>
            }

            {
              (nbSkip > nbUpvote) && !(nbSkip===0 && nbUpvote===0) &&
              <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Typography variant="h6" component="div" align='left' sx={{fontSize: 18, mr:0.5, color:'#f06292'}}> {nbSkip} </Typography>
              <HighlightOffIcon fontSize="small" sx={{mr:1, pb:0.2, color:'#f06292'}}/>
              </Box>
            }
            {listExpandopen ? <ExpandLess /> : <ExpandMore />}
          </Box>
        }
      >
        <ListItemAvatar>
          <Avatar alt="" variant="square" src={event.song_image_url} sx={{ height: '2.5em', width: '2.5em', mr:2 }}/>
        </ListItemAvatar>
        <ListItemText id={labelId} primary={event.song_name} secondary={event.song_singer} sx={{mr:6}}/>

      </ListItem>

      {<Collapse
          key={expandId}
          in={listExpandopen}
          timeout='auto'
          unmountOnExit
      >
          <Box sx={{border: '1px solid gray', borderRadius: '5px',ml:3, mr:3, my:2}}>
          <Typography variant="h6" component="div" align='left' sx={{fontSize: 17, my:1, ml:3}}>
            {nbUpvote} people want to upvote
          </Typography>
          <Typography variant="h6" component="div" align='left' sx={{fontSize: 17, my:1, ml:3}}>
            {nbSkip} people want to skip
          </Typography>
          <Divider sx={{mx:2}}/>


          <List component='li' disablePadding>
            <ListItem button>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <FavoriteBorderIcon sx={{ mr: 2}} />
                  <ListItemText primary='Add to Favorite' />
                </Box>
            </ListItem>

            <ListItem button>
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                <ThumbUpAltOutlinedIcon sx={{mr: 2}} />
                <ListItemText primary='Upvote This Song' />
              </Box>
            </ListItem>

            <ListItem button>
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                <HighlightOffIcon sx={{mr: 2}} />
                <ListItemText primary='Skip This Song' />
              </Box>
            </ListItem>
          </List>
          </Box>
      </Collapse>
      }
      
    </div>
  );

}



export default function TestPage2({ switchIsDrawerOpen }) {
  const [currentSongPlaylistIndex, setCurrentSongPlaylistIndex] = useState(0)
  const prevListSliceOffset = currentSongPlaylistIndex > 1 ? 2 : currentSongPlaylistIndex

  useEffect(() => {
    setCurrentSongPlaylistIndex(songList.findIndex(item => item.id === currentSongID))
  }, [currentSongID])

  return (
    <div>

    <Grid container direction="row" alignItems="center">

      <Grid item xs={6}>
        <IconButton aria-label="play or mute" onClick={switchIsDrawerOpen}>
          <ViewListRoundedIcon color="primary" sx={{ fontSize: 30}}/>
        </IconButton>
      </Grid>

      <Grid item xs={6}>
        <Grid container direction="row" alignItems="center">

          {/* <Grid item xs={2} sm={4}>
            <Box display="flex" justifyContent="flex-end">
              <PersonIcon color="primary" sx={{ fontSize: 30}}/>
            </Box>
          </Grid> */}

          <Grid item xs={12}>
            <Typography variant="body2" color="primary" align='right' sx={{ mr: 1}}>
              Songs in Total: 105
            </Typography>
          </Grid>
          
        </Grid>
      </Grid>

    </Grid>
    

    <Box
      sx={{
        boxShadow: "25", width: { xs: '300px', md: '450px'} , maxWidth: 450, minHeight: 600, borderRadius:3,
        background: customSyle.csBgGradient.lightBlue
      }}
    >
    
    { currentSongPlaylistIndex > 0 &&
    <Box>
    <Typography variant="h3" color="text.secondary" component="div" align='left' sx={{fontSize: 20, ml: 2, pt:2}}>
      Pervious Songs
    </Typography>
    <Divider sx={{mt:1, mx:1}}/>
    <List>
      {songList.length>0 && songList.slice(currentSongPlaylistIndex-prevListSliceOffset, currentSongPlaylistIndex).map((event, index) => {
        const listItemId = `list-item-prev-${index}`;
        const labelId = `list-content-prev-${index}`;

        return (
          <div key={index}>
            <ListItem 
            key={listItemId}
            button
            secondaryAction={
              <Box>
              <IconButton edge="end" aria-label="delete" size="large" onClick={() => {console.log('delete!!')}}>
                <FavoriteBorderIcon fontSize="medium"  />
              </IconButton>
              </Box>
            }
            >
              <ListItemAvatar>
                <Avatar alt="" variant="square" src={event.song_image_url} sx={{ height: '2.5em', width: '2.5em', mr:2 }}/>
              </ListItemAvatar>
              <ListItemText id={labelId} primary={event.song_name} secondary={event.song_singer} sx={{mr:6}}/>
            </ListItem>
          </div>
        );

        })}

    </List>
    </Box>
    }



    <Typography variant="h3" color="primary.main" component="div" align='left' sx={{fontSize: 20, ml: 2, pt:2}}>
      Current Song
    </Typography>
    <Divider sx={{mt:1, mx:1}}/>
    <List>
      {songList.length>0 && songList.slice(currentSongPlaylistIndex, currentSongPlaylistIndex+1).map((event, index) => {
        const listItemId = `list-item-curr-${index}`;
        const labelId = `list-content-curr-${index}`;

        return (
          <div key={index}>
            <ListItem 
            key={listItemId}
            button
            selected={true}
            secondaryAction={
              <Box>
              <IconButton edge="end" aria-label="delete" size="large" onClick={() => {console.log('delete!!')}}>
                <FavoriteBorderIcon fontSize="medium"  />
              </IconButton>
              <IconButton edge="end" aria-label="delete" size="large" onClick={() => {console.log('delete!!')}}>
                  <HighlightOffIcon fontSize="medium"  />
              </IconButton>
              </Box>
            }
            >
              <ListItemAvatar>
                <Avatar variant="square" alt="" src={event.song_image_url} sx={{ height: '2.5em', width: '2.5em', mr:2 }}/>
              </ListItemAvatar>
              <ListItemText id={labelId} primary={event.song_name} secondary={event.song_singer} sx={{mr:6}}/>
            </ListItem>
          </div>
        );

        })}

    </List>


    <Typography variant="h3" color="text.secondary" component="div" align='left' sx={{fontSize: 20, ml: 2, pt:2}}>
      Next Songs
    </Typography>
    <Divider sx={{mt:1, mx:1}}/>
    <List sx={{
      maxHeight: 400, overflow: 'auto',
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar-button': {
        height: 12,
      },
      '&::-webkit-scrollbar': {
        width: '0.4em',
        display: 'none'
        
      },
      '&::-webkit-scrollbar-track': {
        borderRadius: 6,
        background: "transparent",
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 6,
        backgroundColor: '#888',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#555'
      }

    }}>

      {songList.length>0 && songList.slice(currentSongPlaylistIndex+1).map((event, index) => {
        const customListId = `custom-list-${index}`
        const listItemId = `list-item-${index}`;
        const labelId = `list-content-${index}`;
        const expandId = `list-expand-${index}`;
        const nbSkip = [0, 1, 0, 2, 0, 3, 4, 5, 0, 0][Math.floor(Math.random() * 10)]
        const nbUpvote = [0, 1, 0, 2, 0, 3, 4, 5, 0, 0][Math.floor(Math.random() * 10)]

        return (
          <CustomizedListItem key={customListId} event={event} listItemId={listItemId} labelId={labelId} expandId={expandId} nbSkip={nbSkip} nbUpvote={nbUpvote} />
        )


      })}

      
    </List>
    </Box>

    </div>
  )
}
