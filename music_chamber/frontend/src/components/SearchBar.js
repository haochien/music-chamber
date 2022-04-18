import { useState } from 'react'
import { styled, InputBase, IconButton, Box, } from '@mui/material'
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import MsgBar from './MsgBar';


const StyledSearchBar = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  padding: "0 20px",
  borderRadius: "25px",
}));

const StyledSearchBarContent = styled("div")({
  display: "flex",
  justifyContent: "space-between",
});


export default function SearchBar() {
  const navigate = useNavigate()

  const [showMsg, setShowMsg] = useState(false);
  const [chamberId, setChamberId] = useState('')
  const [err, setErr] = useState('yes')

  const switchMsgBar = (trueOrFalse) => {
    setShowMsg(trueOrFalse)
  };
  
  const handleJoinChamber = (e) => {
    fetch('api/get-chamber?id=' + chamberId)
      .then((response) => {
        if (response.ok){
          navigate('/chamber/' + chamberId)
        } else {
          setErr('Invalid Room ID')
          switchMsgBar(true)
          
        }
      })
  };


  return (
    <Box>
      <StyledSearchBar>
        <StyledSearchBarContent>
          <InputBase 
            placeholder="Enter Chamber ID to Join" 
            value = {chamberId}
            onChange = {(e) => setChamberId(e.target.value)}
            sx={{width:'90%'}} 
          />
          <IconButton 
            onClick={handleJoinChamber} 
            sx={{ "&:hover": { backgroundColor: "base.light" } }}
          >
            <LoginIcon fontSize="large" sx={{color:"primary.main"}}/>
          </IconButton>
        </StyledSearchBarContent>
      </StyledSearchBar>

      <MsgBar showMsg={showMsg} msgType="error" duration={3000} msgContent={err} switchMsgBar={switchMsgBar} />
    </Box>
  )
}
