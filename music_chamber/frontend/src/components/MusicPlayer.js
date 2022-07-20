import {useEffect, useState} from 'react';
import { useSession } from '../hooks/useSession';
import { styled } from '@mui/material/styles';
import * as customSyle from '../constants/cssStyle';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonIcon from '@mui/icons-material/Person';
import LinearProgress from '@mui/material/LinearProgress';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';



const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


const featureBar = (featureValue, featureName) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb:1}}>
      <Box sx={{ minWidth: 85 }}>
        <Typography variant="body2" color="text.secondary">{featureName}</Typography>
      </Box>
      <Box sx={{ width: '100%', mr: 1, ml: 1 }}>
        <LinearProgress variant="determinate" value={featureValue * 100} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(featureValue * 100)}%`}</Typography>
      </Box>
    </Box>
  )
}

const featureTextLine = (label, body, footer) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb:1}}>
      <Box>
        <Typography variant="body2" color="text.secondary" align='left'>
          {label}
        </Typography>
      </Box>
      <Box sx={{ mr: 1, ml: 1 }}>
        <Typography variant="body2" color="text.secondary" align='left'>
          {body}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" color="primary.main" align='left' sx={{fontWeight: 'bold'}}>
          {footer}
        </Typography>
      </Box>
    </Box>
  )
}

const translatePopularity = (popularityValue) => {
  if (popularityValue >= 80) {return 'Extremely Popular'} 
  if (popularityValue >= 60 && popularityValue < 80) {return 'Very Popular'} 
  if (popularityValue >= 45 && popularityValue < 60) {return 'In Vogue'} 
  if (popularityValue >= 30 && popularityValue < 45) {return 'Unpopular'} 
  if (popularityValue < 30) {return 'Rarely Known'} 
}


const msToSongTime = (ms) => {
  var pad = (n, z) => ('00' + n).slice(-z);
  return pad((ms%3.6e6)/6e4|0, 1) + ':' + pad((ms%6e4)/1000|0, 2);
}


export default function MusicPlayer({song_name, song_singer, durationInMs, song_energy, song_danceability, song_happiness, 
  song_acousticness, song_speechiness, song_popularity, song_tempo, song_image_url,
  isPlay, togglePlay, isFavorite, toggleFavorite, isSkip, toggleSkip, isChamberStartPlay, switchIsDrawerOpen}) {

  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const csrftoken = useSession('csrftoken')
  const requestOption = (jsonData) =>{
    const optionData = {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: jsonData,
    }
    return optionData
  } 

  const changeValume = async (volume_percent) => {
    console.log('start change volume...')
    const dataChangeValume = {
      volume_percent: volume_percent,
    };
    const jsonChangeValume = JSON.stringify(dataChangeValume, null, '')
  
    const res = await fetch("/api-spotify/change-volume", requestOption(jsonChangeValume))
    console.log('Volume Changed. New Volume:', volume_percent)
  }


  const handleExpandClick = () => {
    setExpanded(!expanded);
  };


  useEffect(() => {
    if (isChamberStartPlay) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 1) {
            //setDurationInMs(durationInMs + 3000)
          }
          return Math.min((oldProgress * durationInMs + 1000)/durationInMs, 1);
        });
      }, 1000);
    
      return () => {
        setProgress(0)
        clearInterval(timer);
      };
    }

  }, [durationInMs, isChamberStartPlay]);


  useEffect(() => {
    if (isPlay) {
      changeValume(90)
    } else {
      changeValume(0)
    }
  }, [isPlay])


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
              Votes To Skip: 4 / 8
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>

    <Card sx={{ boxShadow: "25", maxWidth: 450, minHeight: 450, borderRadius:3, background: customSyle.csBgGradient.lightBlue}}>
      <CardMedia
        component="img"
        alt="track image"
        image={song_image_url}
        sx={{p:2, borderRadius:8, height:420}}
      />
      
      <CardContent>
        <Typography variant="h3" color="text.secondary" component="div" align='center' sx={{fontSize: 15, mb: 2, textShadow: customSyle.csTextShadow.black1}}>
          {song_singer}
        </Typography>
        <Typography variant="h3" color="primary.main" align='center' sx={{fontSize: 35, mb: 4, textShadow: customSyle.csTextShadow.black1}}>
          {song_name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb:1}}>
          <Box sx={{ width: '100%', ml: 1, mr: 2}}>
            <LinearProgress variant="determinate" value={progress * 100}/>
          </Box>
          <Box sx={{ minWidth: 37 }}>
            <Typography variant="body2" color="text.secondary">{msToSongTime(durationInMs)}</Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="play or mute" onClick={togglePlay}>
          {isPlay ? <VolumeOffIcon /> : <PlayCircleOutlineIcon />}
        </IconButton>
        <IconButton aria-label="add to favorites" onClick={toggleFavorite}>
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <IconButton aria-label="skip song" onClick={toggleSkip}>
          {isSkip ? <CancelIcon /> : <HighlightOffIcon />}
        </IconButton>

        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="h5" color="text.secondary" align='left' sx={{fontSize: 15, mb: 2, mt: 2, fontWeight:'bold'}}>
            Song Feature
          </Typography>
          {featureBar(song_energy, 'Energy')}
          {featureBar(song_danceability, 'Danceability')}
          {featureBar(song_happiness, 'Happiness')}
          {featureBar(song_acousticness, 'Acousticness')}
          {featureBar(song_speechiness, 'Speechiness')}

          {featureTextLine('Tempo:', `${song_tempo} (BPM)`, '')}
          {featureTextLine('Popularity:', `${song_popularity} / 100 points`, `(${translatePopularity(song_popularity)})`)}
        </CardContent>
      </Collapse>

    </Card>

    </div>
  );
}
