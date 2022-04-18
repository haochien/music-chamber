import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
      background: {
        default: "#212121"
      },

      text: {
        primary: "#212121"
      },
    
      base: {
        light: '#e0e0e0',
        main: '#212121',
        dark: '#171717',
        contrastText: '#f5f5f5',
      },
  
      primary: {
        light: '#69a1ff',
        main: '#448aff',
        dark: '#2962ff',
        contrastText: '#f5f5f5',
      },
      secondary: {
        light: '#f7f7f7',
        main: '#f5f5f5',
        dark: '#ababab',
        contrastText: '#212121',
      },
  
  
    },
  });