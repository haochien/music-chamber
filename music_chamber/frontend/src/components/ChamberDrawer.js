import {useEffect, useState, Fragment} from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import NightlifeRoundedIcon from '@mui/icons-material/NightlifeRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';

const firstLayerItems = [{id: 'player', name: 'Song on Play', icon:<NightlifeRoundedIcon />}, 
                         {id: 'playlist', name: 'Check Playlist', icon:<QueueMusicRoundedIcon />}, 
                         {id: 'addSong', name: 'Add Songs', icon:<PlaylistAddRoundedIcon />}]

const secondLayerItems = [{id: 'members', name: 'Chamber Members', icon:<SupervisorAccountRoundedIcon />}, 
                          {id: 'chatRoom', name: 'Chat Room', icon:<MessageRoundedIcon />}]

const allDrawerItem = [{id: 'layer1', layerName: 'Music Setting', layerData: firstLayerItems}, 
                       {id: 'layer2', layerName: 'User Interaction',layerData: secondLayerItems}]

export default function ChamberDrawer({ anchor, isDrawerOpen, switchIsDrawerOpen, switchSelectedComponent }) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  
  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const handleListItemClick = (event, indexLayer, indexItem, itemID) => {
    setSelectedLayer(indexLayer);
    setSelectedItem(indexItem);
    switchSelectedComponent(itemID)
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      
      {allDrawerItem.map((layer, indexLayer) => (
        <Fragment key={layer.id}>

          <Typography variant="h3" color="primary.main" sx={{fontSize: 18, ml: 2, mt: 3}}>
            {layer.layerName}
          </Typography>

          <List>
            {layer.layerData.map((item, indexItem) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton 
                  selected={selectedItem === indexItem && selectedLayer ===indexLayer}
                  onClick={(event) => handleListItemClick(event, indexLayer, indexItem, item.id)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {
            (allDrawerItem.length > 1) && (indexLayer + 1 < allDrawerItem.length) && <Divider />
          }
          
        </Fragment>

      ))}
    </Box>
  );


  useEffect(() => {
    if (isDrawerOpen) {
      setState({ ...state, [anchor]: true });
      switchIsDrawerOpen()
    }
  }, [isDrawerOpen])


  
  return (
    <Drawer
      anchor={anchor}
      open={state[anchor]}
      onClose={toggleDrawer(anchor, false)}
    >
      {list(anchor)}
    </Drawer>

  )
}
