import {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinearProgress from '@mui/material/LinearProgress';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';


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


export default function TestPage() {
  const durationInMs = 180000
  const song_energy = 0.842
  const song_danceability = 0.842
  const song_happiness = 0.842
  const song_acousticness = 0.142
  const song_speechiness = 0.0556
  const song_popularity = 72
  const song_tempo = 118.211
  const [isPlay, setIsPlay] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);


  const togglePlay = () => {
    if (isPlay) {
      setIsPlay(false)
    } else {
      setIsPlay(true)
    }
  }

  const toggleFavorite = () => {
    if (isFavorite) {
      setIsFavorite(false)
    } else {
      setIsFavorite(true)
    }
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 1) {
          clearInterval(timer);
          return 0;
        }
        return Math.min((oldProgress * durationInMs  + 1000)/durationInMs, 1);
      });
    }, 1000);
  
    return () => {
      clearInterval(timer);
    };
  }, [durationInMs]);

  return (
    <Card sx={{ maxWidth: 350, minHeight: 500, borderRadius:3}}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="300"
        image="https://i.scdn.co/image/ab67616d0000b273ba02e4c2026b51da26aa58bb"
        sx={{p:2, borderRadius:8}}
      />
      
      <CardContent>
        <Typography variant="h3" color="text.secondary" component="div" align='center' sx={{fontSize: 15, mb: 3}}>
          New West
        </Typography>
        <Typography variant="h3" color="primary.main" align='center' sx={{fontSize: 35, mb: 4}}>
          Those Eyes
        </Typography>
        <LinearProgress variant="determinate" value={progress * 100} sx={{ml: 1, mr: 1, mb:2}}/>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="play or mute" onClick={togglePlay}>
          {isPlay ? <VolumeOffIcon /> : <PlayCircleOutlineIcon />}
        </IconButton>
        <IconButton aria-label="add to favorites" onClick={toggleFavorite}>
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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
  );
}




// const song_energy = 0.842
// const song_danceability = 0.842
// const song_happiness = 0.842
// const song_acousticness = 0.142
// const song_speechiness = 0.0556
// const song_popularity = 72
// const song_tempo = 118.211