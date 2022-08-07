import {useEffect, useState} from 'react';
import * as customSyle from '../../constants/cssStyle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function TestPage4({ token, openAddSong, switchOpenAddSong}) {

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") 
        return;
    switchOpenAddSong(false);
  }


  return (
    <div>

    <Dialog open={openAddSong} onClose={handleClose} scroll='paper' fullWidth={true} disableEscapeKeyDown={true}>
      <Box sx={{background: customSyle.csBgGradient.lightBlue}}>
      <DialogTitle>Add Songs to Playlist</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Search and add songs to the playlist of your chamber.
        </DialogContentText>

      </DialogContent>
      <DialogActions>
        <Button onClick={()=>{console.log('add song!')}}>Add Song</Button>
      </DialogActions>
      </Box>
    </Dialog>

  </div>
  )
}
