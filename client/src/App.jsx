import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Logs from "./pages/Logs";
import Error from "./pages/Error";
import Analysis from "./pages/Analysis";

import Nav from "./static/Nav";
import Footer from "./static/Footer";
import Overview from "./pages/Overview";

function App() {
  return (
    <>
      <Router>
        <main>
          <Nav />
          <Routes>
            <Route path='/' element={<Overview />} />
            <Route path='/logs' element={<Logs />} />
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