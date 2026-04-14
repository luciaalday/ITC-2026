import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/Error";

function App() {
  return (
    <>
      <Router>
        <main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='*' element={<Error code={404} />} />
          </Routes>
        </main>
      </Router>
    </>
  )
}

export default App