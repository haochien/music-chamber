import {BrowserRouter, Link, Routes, Route} from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles';

// page components
import Home from './pages/home/Home'
import CreateChamber from './pages/create_chamber/CreateChamber'

// styles
import './App.css';



const theme = createTheme({
  palette: {
    background: '#448aff',

    base: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },

    primary: {
      light: '#f5f5f5',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#448aff',
      main: '#448aff',
      dark: '#2962ff',
      contrastText: '#f5f5f5',
    },


  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/create-chamber" element={<CreateChamber />}/>
        </Routes>
      </BrowserRouter>
    </div>
    </ThemeProvider>
  );
}

export default App;
