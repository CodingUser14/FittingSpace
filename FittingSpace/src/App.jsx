import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Camera1 from './Pages/Camera1'
import Start from './Pages/Start'
import Page1 from './Pages/Page1'


function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start/>}/>
        <Route path="/Camera1" element={<Camera1/>}/>
        <Route path="/Page1" element={<Page1/>}/>
      </Routes> 
    </Router>
  )
}
export default App;