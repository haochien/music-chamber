import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { CssBaseline } from '@mui/material';

// page components
import Home from './pages/home/Home'
import CreateChamber from './pages/create_chamber/CreateChamber'
import Chamber from './pages/chamber/Chamber'
import TestPage from './pages/test_page/TestPage'



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/create-chamber" element={<CreateChamber />}/>
            <Route path="/chamber/:id" element={<Chamber />}/>
            <Route path="/test-page/" element={<TestPage />}/>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
