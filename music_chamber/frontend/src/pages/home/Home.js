import {useEffect, useState, Fragment} from 'react';
import { Box } from '@mui/material'
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import React from 'react'
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import SearchBar from '../../components/SearchBar'
import img_homepage_1 from '../../static/home_page/img_homepage_1.jpg'
import compo1 from '../../static/home_page/compo1.png'


export default function Home() {
  return (
    // <Box sx={{
    //   display: 'flex',
    //   justifyContent: "center",
    //   alignItems: 'center',
    //   minHeight: '100vh'
    // }}>
    //   <Box sx={{
    //     width: '60vw',
    //   }}>
    //       <SearchBar />
    //   </Box>
    // </Box>
    

    <Fragment>
    <Paper sx={{position: 'relative', width: '100%', height: 650, objectFit: 'cover', backgroundPosition: 'center', zIndex: -1, backgroundImage: `url(${img_homepage_1})`}}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.2)',
          zIndex: -1
        }}
      />

      <Grid container spacing={10} justifyContent="center" alignItems="center" >

        <Grid item xs={8}>
          <Typography component="h1" variant="h3" align='center' sx={{mt:18, color:'white'}}>
            Join Music Chamber
          </Typography>

          <Typography component="h3" variant="h6" align='center'sx={{mt:2, color:'white'}}>
            Listen music with people around the world
          </Typography>

        </Grid>

      </Grid>
    </Paper>

    <Box sx={{
      position:'relative', top:-200, mb:-7,
      display: 'flex',
      justifyContent: "center",
      alignItems: 'center',

    }}>
      <Box sx={{
        width: 450,
      }}>
          <SearchBar />
      </Box>
    </Box>

    



    <Paper sx={{position: 'relative', width: '100%', minHeight: 620, backgroundColor:'white' }}>


      <Container sx={{ py: 8 }} maxWidth="xl">
      <Grid container spacing={5} direction="row" justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={5}>

          <Box
            component="img"
            sx={{
              width: {xs:'100%', md:550},
            }}
            alt="Profile_Demo"
            src={compo1}
          />

        </Grid>

        <Grid item xs={12} md={7}>
          <Box sx={{height:'100%'}}>
            <Typography component="h3" variant="h3" color="#212121"  sx={{mt:5, maxWidth:'65%'}} >
              Find the Music Chamber You Like
            </Typography>

            <Typography component="h3" variant="h5" color="#212121" sx={{mt:5, maxWidth:'80%'}}>
              You can find different types of music in the world of Music Chamber and listen music together with people while your work or studying. Check the the chamber you like now.
            </Typography>


            <Button variant="contained" color="primary" sx={{width: 150, fontSize:17, height:40, mt:8}} onClick={() => {console.log('Followed!!')}}  >
              {`Explore`}
            </Button>
          </Box>
        </Grid>
      </Grid>
      </Container>


    </Paper>
    


    <Paper sx={{position: 'relative', width: '100%', height: 600, backgroundColor:'#212121' }}>
    </Paper>
    </Fragment>


  )
}
