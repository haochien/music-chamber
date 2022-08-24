import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { CssBaseline } from '@mui/material';

// page components
import Navbar from './components/Navbar'
import Home from './pages/home/Home'
import CreateChamber from './pages/create_chamber/CreateChamber'
import Chamber from './pages/chamber/Chamber'
import ExploreChamber from './pages/explore_chamber/ExploreChamber'
import TestPage from './pages/test_page/TestPage'
import TestPage2 from './pages/test_page/TestPage2'
import TestPage3 from './pages/test_page/TestPage3'
import TestApp from './pages/test_page/TestApp'



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <BrowserRouter>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/create-chamber" element={<CreateChamber />}/>
            <Route path="/chamber/:id" element={<Chamber />}/>
            <Route path="/explore-chamber" element={<ExploreChamber />}/>
            <Route path="/test-page/" element={<TestPage />}/>
            <Route path="/test-page2/" element={<TestPage2 />}/>
            <Route path="/test-page3/" element={<TestPage3 />}/>
            <Route path="/test-app/" element={<TestApp />}/>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
