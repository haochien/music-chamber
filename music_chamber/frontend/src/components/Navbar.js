import {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom"
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { fontSize } from '@mui/system';

import LoginBox from './LoginBox'
import { checkIsAuth, logoutSpotify } from '../middlewares/auth';
import { useSession } from '../hooks/useSession';

const settings = [{id: 'profile', name: 'My Profile', url:'/profile'}, {id: 'conection', name: 'Connection', url:'/profile'}, 
                  {id: 'logout', name: 'Logout', url:'/'}];
const pages = [{id: 'creatChamber', name: 'Creat Chamber', url: '/create-chamber'}, 
               {id: 'explore', name: 'Explore', url: '/explore-chamber'}, 
               {id: 'about', name: 'About', url: '/'}];
const appName = 'Music Chamber'


export default function Navbar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [openLogin, setOpenLogin] = useState(false);
    const [isAuth, setIsAuth] = useState(false)

    const navigate = useNavigate()
    const csrftoken = useSession('csrftoken')
  
    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
  
    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };

    const switchOpenLogin = (trueOrFalse) => {setOpenLogin(trueOrFalse)};

    const handleSettingMenuClick = async (event, selection, url) => {
      if (selection === 'logout') {
        handleCloseUserMenu()
        await logoutSpotify(csrftoken)
        setIsAuth(false)
        window.location.reload();
      }

      if (selection === 'profile') {
        console.log('Go to My Profile')
        handleCloseUserMenu()
        navigate(url)
      }

      if (selection === 'conection') {
        console.log('Go to Connection')
        handleCloseUserMenu()
        navigate(url)
      }
    }


    useEffect(async () => {
      const isUserAuth = await checkIsAuth()
      // const isUserAuth = true
      setIsAuth(isUserAuth)
    }, [isAuth])
  
    return (
      <Box>

      <LoginBox openLogin={openLogin} switchOpenLogin={switchOpenLogin} isBackDropAllowed={true} />
      
      <AppBar position="static" color="transparent">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <HeadphonesIcon sx={{ display: { xs: 'none', md: 'flex', color:'white', fontSize: 30 }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              {appName}
            </Typography>
  
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="primary"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' }, mt: '5px'
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.id} onClick={() => {
                    handleCloseNavMenu()
                    navigate(page.url)
                  }}>
                    <Typography textAlign="center" color="black">{page.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            
            <HeadphonesIcon sx={{ display: { xs: 'flex', md: 'none', color: 'white' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              {appName}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', justifyContent: "right" } }}>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  onClick={ () => {
                    navigate(page.url)
                  }}
                  sx={{ my: 2, mx: 2, color: 'white', display: 'block', fontSize: 15}}
                >
                  {page.name}
                </Button>

              ))}
            </Box>


            <Box sx={{ flexGrow: 0 }}>
              { isAuth &&
                <IconButton onClick={handleOpenUserMenu} sx={{ p: {xs: 1, md: 2} }}>
                  <Avatar variant="square" alt="Hirst Letter" src="..." sx={{ height: {xs: '1.2em', md:'1.3em'}, width: {xs: '1.2em', md:'1.3em'}, borderRadius:1.5 }}/>
                </IconButton>
              }

              { !isAuth &&
                <Box>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => {setOpenLogin(true)}}
                  sx={{borderWidth:1, ml: {xs: 0, md: 2}, display: { xs: 'none', md: 'flex' } }}
                >
                  Login
                </Button>

                <IconButton onClick={() => {setOpenLogin(true)}} sx={{ p: {xs: 1, md: 2}, display: { xs: 'flex', md: 'none' } }}>
                  <Avatar variant="square" alt="login" src="" sx={{ height: {xs: '1.2em', md:'1.3em'}, width: {xs: '1.2em', md:'1.3em'}, borderRadius:1.5 }}/>
                </IconButton>
                </Box>
              }
              

              <Menu
                sx={{ mt: '53px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.id} onClick={(event) => handleSettingMenuClick(event, setting.id, setting.url)}>
                    <Typography textAlign="center" color="black">{setting.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
          </Box>
  

          </Toolbar>
        </Container>
      </AppBar>

      </Box>
    );
}
