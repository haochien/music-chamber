import {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import img_sleeping_owl from '../../static/img_sleeping_owl.png'
import * as customSyle from '../../constants/cssStyle';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
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
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LyricsIcon from '@mui/icons-material/Lyrics';


const createUserList = () => {
    const myListIndex =  [...Array(1).keys()]
    const myListItem = myListIndex.map((item, index) => {
      return {id: `UserId${index}`, is_host: item===0 ? true : false, display_name: `User Name ${item}`, country: `Country ${item}`, images: ''}
    })
  
    return myListItem
  }
const userList = createUserList()



const UserDetails = ({ expandId, listExpandopen}) => {
  return(
    <Collapse
    key={expandId}
    in={listExpandopen}
    timeout='auto'
    unmountOnExit
    >
      <Box sx={{border: '1px solid gray', borderRadius: '5px',ml:3, mr:3, my:2}}>
      <List component='li' disablePadding>
        <ListItem button>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <HandshakeOutlinedIcon sx={{ mr: 2}} />
            <ListItemText primary='Add as Friend' />
          </Box>
        </ListItem>

        <ListItem button>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <AssignmentIndIcon sx={{ mr: 2}} />
              <ListItemText primary='See Profile' />
            </Box>
        </ListItem>

        <ListItem button>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <LyricsIcon sx={{mr: 2}} />
            <ListItemText primary="Check User's Playlists" />
          </Box>
        </ListItem>
      </List>
      </Box>
    </Collapse>
  )
}


const HostListItem = ({ event, listItemId, labelId, expandId }) => {
  const [ listExpandopen, setListExpandopen ] = useState(false)
  const handleListExpand = (event) => {setListExpandopen(!listExpandopen)}

  return(
    <div>
      <ListItem 
      key={listItemId}
      button
      onClick={handleListExpand}
      selected={true}
      secondaryAction={
        <Box sx={{display: 'flex', alignItems: 'center'}}>
        {listExpandopen ? <ExpandLess /> : <ExpandMore />}
        </Box>
      }
      >
        <ListItemAvatar>
          <Avatar alt="" src={event.images} sx={{ height: '2.5em', width: '2.5em', mr:2 }}/>
        </ListItemAvatar>
        <ListItemText id={labelId} primary={event.display_name} secondary={event.country} sx={{mr:6}}/>
      </ListItem>

      <UserDetails expandId={expandId} listExpandopen={listExpandopen} />
    </div>
  )
}


const GuestListItem = ({ event, listItemId, labelId, expandId }) => {
  const [ listExpandopen, setListExpandopen ] = useState(false)
  const handleListExpand = (event) => {setListExpandopen(!listExpandopen)}

  return(
    <div>
      <ListItem 
        key={listItemId}
        button
        onClick={handleListExpand}
        secondaryAction={
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {listExpandopen ? <ExpandLess /> : <ExpandMore />}
          </Box>

        }
      >
        <ListItemAvatar>
          <Avatar alt="" src={event.images} sx={{ height: '2.5em', width: '2.5em', mr:2 }}/>
        </ListItemAvatar>
        <ListItemText id={labelId} primary={event.display_name} secondary={event.country} sx={{mr:6}}/>
      </ListItem>

      <UserDetails expandId={expandId} listExpandopen={listExpandopen} />
 
    </div>
  );

}


export default function TestPage3({ switchIsDrawerOpen }) {
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
          <Grid item xs={12}>
            <Typography variant="body2" color="primary" align='right' sx={{ mr: 1}}>
                Members in Total: 8
            </Typography>
          </Grid>
        </Grid>
      </Grid>

    </Grid>


    <Box
      sx={{
        boxShadow: "25", width: { xs: '300px', md: '450px'} , maxWidth: 450, minHeight: 700, borderRadius:3,
        background: customSyle.csBgGradient.lightBlue
      }}
    >


    <Typography variant="h3" color="primary.main" component="div" align='left' sx={{fontSize: 20, ml: 2, pt:2}}> Host </Typography>
    <Divider sx={{mt:1, mx:1}}/>
    <List>
      {userList.length>0 && userList.filter(item => item.is_host === true).map((event, index) => {
        const customListId = `custom-list-host-${index}`
        const listItemId = `list-item-host-${index}`;
        const labelId = `list-content-host-${index}`;
        const expandId = `list-expand-host-${index}`;

        return (
          <HostListItem key={customListId} event={event} listItemId={listItemId} labelId={labelId} expandId={expandId} />
        );

        })}
    </List>


    <Typography variant="h3" color="text.secondary" component="div" align='left' sx={{fontSize: 20, ml: 2, pt:2}}>Guests</Typography>
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

      {userList.length>0 && userList.filter(item => item.is_host === false).map((event, index) => {
        const customListId = `custom-list-guest-${index}`
        const listItemId = `list-item-guest-${index}`;
        const labelId = `list-content-guest-${index}`;
        const expandId = `list-expand-guest-${index}`;

        return (
          <GuestListItem key={customListId} event={event} listItemId={listItemId} labelId={labelId} expandId={expandId} />
        )

      })}
    </List>

    
    <List>
      {userList.length>0 && userList.filter(item => item.is_host === false).length === 0 && 
        <Grid
          container
          spacing={3}
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{mt:2, mb:3}}

        >
          <Grid item xs={12}>
            <Typography variant="h3" color="text.secondary" component="div" align='center' sx={{fontSize: 20}}>
              Your Chamber is very silent
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box
              component="img"
              sx={{
                width: { xs: 200, md: 300 },
                maxWidth: { xs: '100%', md: 300 },
              }}
              alt="Sleeping Owl"
              src={img_sleeping_owl}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" color="primary" sx={{borderWidth:3}} onClick={() => {navigator.clipboard.writeText(window.location.href)}}  >
              {`Copy Chamber Link  &  Share`}
            </Button>

          </Grid>
        </Grid>
      }
    </List>


    <List>
    {userList.length>0 && userList.filter(item => item.is_host === false).length > 0 && 
        <Grid
          container
          spacing={3}
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{mt:2, mb:3}}
        >
          <Grid item xs={12}>
            <Typography variant="h3" color="text.secondary" component="div" align='center' sx={{mx:1, fontSize: 18}}>
              Invite Your Friends to The Chamber
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" color="primary" sx={{borderWidth:3}} onClick={() => {navigator.clipboard.writeText(window.location.href)}}  >
              {`Copy Chamber Link  &  Share`}
            </Button>

          </Grid>

        </Grid>
      }
      </List>

    </Box>
    </div>
  )
}
