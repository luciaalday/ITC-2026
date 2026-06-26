import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <h6>ITC 2026 &copy; University of Arizona TPEG</h6>
      <div className="flex">
        <Link to="/">Overview</Link>
        <Link to="/logs">View logs</Link>
        <Link to="/analysis">View analysis</Link>
      </div>
    </footer>
  )
}