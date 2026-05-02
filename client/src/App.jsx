import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/Error";
import Analysis from "./pages/Analysis";

import Nav from "./static/Nav";
import Footer from "./static/Footer";

function App() {
  return (
    <>
      <Router>
        <main>
          <Nav />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/analysis' element={<Analysis />} />
            <Route path='*' element={<Error code={404} />} />
          </Routes>
          <Footer />
        </main>
      </Router>
    </>
  )
}

export default App