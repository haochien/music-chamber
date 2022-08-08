import {useEffect, useState} from 'react';
import * as customSyle from '../constants/cssStyle';
import img_spotify_icon from '../static/img_spotify_icon.png'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { authUser } from '../middlewares/auth';


export default function LoginBox({ openLogin, switchOpenLogin, isBackDropAllowed }) {
  const [showCircular, setShowCircular] = useState(false)

  const handleClose = (event, reason) => {
    if (reason && reason === "backdropClick") {
      if (isBackDropAllowed) {switchOpenLogin(false)}
    } else{
      switchOpenLogin(false);
    }

  };

  const handleLogin = async () => {
    await authUser()
    //TODO: make error handler here in case authUser failed 
    setShowCircular(true)
  }


  return (
    <div>
      <Dialog open={openLogin} onClose={handleClose} scroll='paper' fullWidth={true} disableEscapeKeyDown={true} >
        <Box sx={{background: customSyle.csBgGradient.lightBlue}}>
        <DialogTitle>Log in</DialogTitle>

        <Divider sx={{ mx:2 }}/>

        <DialogContent>

          <DialogContentText>
            To listen music with others and use more functions in Music Chamber, you must have Spotify Premium account.  
          </DialogContentText>
        
        { !showCircular && <Box sx={{display: 'flex', justifyContent: {xs: "center", md: "left"} }}>
          <Button 
            variant="contained"
            color="primary" 
            onClick={() => {handleLogin()}}
            sx={{ borderWidth:1, textTransform: 'none', mt:4, mb: 3, px:3 , borderRadius:5}}
          >
            <Box
              component="img"
              sx={{ width: 20, maxWidth: 20, mr:2, my:1}}
              alt="Spotify Icon"
              src={img_spotify_icon}
            />

            Continue with Spotify
          </Button>
        </Box>
        }
        

        { showCircular && <Box sx={{ display: 'flex', justifyContent: 'center', my:5}}>
          <CircularProgress />
        </Box>
        }

        </DialogContent>

        </Box>
      </Dialog>        
    </div>
  )
}
