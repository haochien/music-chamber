import {useEffect, useState} from 'react';
import * as customSyle from '../constants/cssStyle';
import { useSongSearch } from '../hooks/useSongSearch';
import MsgBar from './MsgBar';
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


export default function AddSong({ token, openAddSong, switchOpenAddSong, updateSongIdsToBeAdded, songIdsToBeAdded, switchSelectedComponent}) {
    const [openSongSearchList, setOpenSongSearchList] = useState(false);
    const [queryResult, setQueryResult] = useState([])
    const [queryInput, setQueryInput] = useState([])
    const [songList, setSongList] = useState([])

    const [showMsg, setShowMsg] = useState(false);
    const [err, setErr] = useState('')

    const dataResult = useSongSearch(token, queryInput)

    const switchMsgBar = (trueOrFalse) => {
      setShowMsg(trueOrFalse)
    };

    const handleClose = (event, reason) => {
      if (reason && reason === "backdropClick") 
        // if length if songIdsToBeAdded > 0 (i.e. not the initial chamber creating stage, backdropClick of closing add song window is allowed)
        if (songIdsToBeAdded.length > 0) {
          setSongList([])
          switchSelectedComponent('playlist')
          switchOpenAddSong(false);
        } else {
          return;
        }
      
      if (reason && reason == "saved") {
          setSongList([])
          switchOpenAddSong(false);
          // if length if songIdsToBeAdded > 0 (i.e. not the initial chamber creating stage, set seleted item of drawer to playlist after saving add song)
          if (songIdsToBeAdded.length > 0) {
            switchSelectedComponent('playlist')
          }
      }

      switchOpenAddSong(false);
    }

    const deleteListItem = (index) => {
      setSongList(preSonglist => {
        //return preSonglist.filter(song => id !== song.id)
        return [...preSonglist.slice(0, index), ...preSonglist.slice(index + 1, preSonglist.length)]
      })
    }

    const addToPendingList = (item) => {
      setSongList(preSonglist => {
        return [...preSonglist, item]
      })
    }

    const confirmAddSong = (event) => {
      if (songList.length > 0) {
         let arraySongId = songList.map(songObj => songObj.id)
         updateSongIdsToBeAdded(arraySongId)
         handleClose(event, 'saved')
      } else {
        setErr('Please add at least one song')
        switchMsgBar(true)
      }
    }

    
    useEffect(() => {
      if (dataResult != undefined && dataResult.length > 0) {
        setQueryResult(dataResult)
      } else {
        setQueryResult([])
      }
    }, [dataResult])

  
    return (
      <div>

        <Dialog open={openAddSong} onClose={handleClose} scroll='paper' fullWidth={true} disableEscapeKeyDown={true}>
          <Box sx={{background: customSyle.csBgGradient.lightBlue}}>
          <DialogTitle>Add Songs to Playlist</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Search and add songs to the playlist of your chamber.
            </DialogContentText>

            <Autocomplete
                sx={{ mt: 3, mb: 1 }}
                freeSolo
                
                open={openSongSearchList}
                onClose={() => setOpenSongSearchList(false)}
                onChange={(event, newValue) => {
                  if (newValue != null && newValue.hasOwnProperty('title')) {
                    addToPendingList(newValue)
                  }
                  
                }}
                //inputValue={queryInput}
                onInputChange={(event, newInputValue) => {
                  if (newInputValue.length === 0) {
                    if (openSongSearchList) setOpenSongSearchList(false);
                  } else {
                    if (!openSongSearchList) setOpenSongSearchList(true);
                  }
                  setQueryInput(newInputValue);
                }}
                id="song-query"
                options={queryResult}
                filterOptions={(options, state) => options}

                getOptionLabel={(option) => {
                  //return option.title || ""
                  if (option.hasOwnProperty('title')) {
                    return option.title;
                  }
                  return option;
                }}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <img
                      loading="lazy" width="50" src={option.image_url} alt=""
                    />
                    {option.title} ({option.artist})
                  </Box>
                )}

                renderInput={(params) => {
                  return <TextField {...params} autoFocus label="Search Song" />
                }}
              />

              <List>
                {songList.length>0 && songList.map((event, index) => {
                  const listItemId = `list-item-${index}`;
                  const labelId = `list-content-${index}`;
                  const dividerId = `list-divider-${index}`;

                  return(
                    <div key={index}>
                      {index>0 ? <Divider key={dividerId}/> : null}
                      
                      <ListItem 
                        key={listItemId}
                        button
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" size="large" onClick={() => deleteListItem(index)}>
                            <DeleteForeverIcon fontSize="medium" sx={{ color: 'primary.main'}} />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar alt="" src={event.image_url} />
                        </ListItemAvatar>
                        <ListItemText id={labelId} primary={event.title} secondary={event.artist} />
                      </ListItem>
                      
                    </div>
                  );
                })}
                
              </List>

              

          </DialogContent>
          <DialogActions>
            <Button onClick={confirmAddSong}>Add Song</Button>
          </DialogActions>
          </Box>
        </Dialog>

        <MsgBar showMsg={showMsg} msgType="error" duration={3000} msgContent={err} switchMsgBar={switchMsgBar} />
      </div>
    );
}
