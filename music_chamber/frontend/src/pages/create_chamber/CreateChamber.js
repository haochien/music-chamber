import {useState, useEffect} from 'react';
import { Avatar, Button, TextField, FormControl,
  FormGroup, FormLabel, FormControlLabel, Switch,
  Grid, Box, Typography, Container } from '@mui/material'
import MusicNote from '@mui/icons-material/MusicNote';
import { useNavigate } from 'react-router-dom';

import { useSession } from '../../hooks/useSession';
import LoginBox from '../../components/LoginBox'
import { checkIsAuth } from '../../middlewares/auth';
import * as customSyle from '../../constants/cssStyle';


export default function CreateChamber() {
  const [accessGuestCanPause, setAccessGuestCanPause] = useState(false);
  const [accessGuestCanAdd, setAccessGuestCanAdd] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [openLogin, setOpenLogin] = useState(false);
  const [isAuth, setIsAuth] = useState(false)

  const navigate = useNavigate()
  const csrftoken = useSession('csrftoken')

  const switchOpenLogin = (trueOrFalse) => {setOpenLogin(trueOrFalse)};

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const postData = {
      chamber_name: formData.get('chamber-name'),
      votes_song_skip: formData.get('votes-song-skip'),
      access_guest_can_pause: accessGuestCanPause,
      //access_guest_can_add: accessGuestCanAdd,
      is_public: isPublic,
    };
    const jsonPostData = JSON.stringify(postData, null, '')

    const requestOption = {
      //credentials: 'include',
      //mode: 'same-origin',
      method: "POST",
      headers: {
        //'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: jsonPostData,
    };

    fetch("/api/create-chamber", requestOption)
      .then((response) => response.json())
      .then((data) => navigate('/chamber/' + data.chamber_id))

  };


  useEffect(async () => {
    const isUserAuth = await checkIsAuth()
    setIsAuth(isUserAuth)
    if (!isUserAuth) {
      setOpenLogin(true)
    }

  }, [isAuth])


  return(
    <Box>

    <LoginBox openLogin={openLogin} switchOpenLogin={switchOpenLogin} isBackDropAllowed={false} />

    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mx: '5px', mb:'80px', mt:'80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid white',
          borderRadius: '25px',
          background: customSyle.csBgGradient.lightBlue,
          padding: 4,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', color: 'secondary.main'}}>
          <MusicNote />
        </Avatar>

        <Typography component="h1" variant="h6" >
          Create Your Music Chamber
        </Typography>

        <Box component="form" Validate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="chamber-name"
                name="chamber-name"
                label="Chamber Name"
                autoComplete="chamber-name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                type="number"
                fullWidth
                id="votes-song-skip"
                name="votes-song-skip"
                label="Votes Required to Skip Song"
                defaultValue="2"
                inputProps={{
                  min: 1,
                  style: { textAlign: "left" },
                }}
                
                
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend" >
                  Guest Access Control
                </FormLabel>

                <FormGroup >
                  <FormControlLabel 
                    control={<Switch checked={accessGuestCanPause} onChange={(e) => setAccessGuestCanPause(e.target.checked)} />} 
                    label="Pause Song" 
                  />
                  <FormControlLabel 
                    control={<Switch checked={accessGuestCanAdd} onChange={(e) => setAccessGuestCanAdd(e.target.checked)} />} 
                    label="Add Song" 
                  />
                </FormGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend" >
                  Chamber Setting
                </FormLabel>

                <FormGroup row>
                  <FormControlLabel
                    control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                    label="Public Chamber" 
                  />
                </FormGroup>
              </FormControl>
            </Grid>


          </Grid>

          <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ bgcolor:'primary.main', '&:hover': {bgcolor:'primary.dark'} }}
              >
                Create
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ bgcolor:'primary.main', '&:hover': {bgcolor:'primary.dark'} }}
              >
                Leave
              </Button>
            </Grid>

          </Grid>
          

        </Box>
      </Box>
    </Container>

    </Box>
  )
}

