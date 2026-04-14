import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/Error";
import Analysis from "./pages/Analysis";

function App() {
  return (
    <>
      <Router>
        <main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/Analysis' element={<Analysis />} />
            <Route path='*' element={<Error code={404} />} />
          </Routes>
        </main>
      </Router>
    </>
  )
}

export default App