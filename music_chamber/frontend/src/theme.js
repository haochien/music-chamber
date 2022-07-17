import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            //backgroundColor: '#FAACA8',
            // backgroundImage: `radial-gradient(circle, #000527, #00062c, #000730, #000735, #000839, #000b3e, #000d42, #000f47, #00134e, #001654, #001a5b, #001e62)`,
            backgroundImage: `radial-gradient(circle, #000314, #000418, #01041b, #01051f, #010522, #010526, #010629, #00062d, #000732, #000736, #00083b, #00083f)`,
            // backgroundImage: `linear-gradient(to right, #000527, #00062c, #000730, #000735, #000839, #000b3e, #000d42, #000f47, #00134e, #001654, #001a5b, #001e62)`,
          },
        },
      },
    },

    shadows: [...createTheme({}).shadows, "0px 11px 15px -7px rgba(231, 242, 241, 0.20), 0px 24px 38px 3px rgba(231, 242, 241, 0.14), 0px 9px 46px 8px rgba(231, 242, 241, 0.12)", "0px 4px 20px 5px rgba(231, 242, 241, 0.30)"],

    typography: {
      fontFamily: [
        'Rubik',
        'sans-serif',
      ].join(','),
    },

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