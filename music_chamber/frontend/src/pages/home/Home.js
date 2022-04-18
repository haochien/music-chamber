import { Box } from '@mui/material'
import React from 'react'
import SearchBar from '../../components/SearchBar'


export default function Home() {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: "center",
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <Box sx={{
        width: '60vw',
      }}>
          <SearchBar />
      </Box>
    </Box>
    
  )
}
