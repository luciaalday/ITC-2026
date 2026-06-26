import imgref from '../assets/TPEG_logo_whiteoutline-05.png';
import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav>
      <div className="nav-button left">
        <img src={imgref} width={50} alt='TPEG' />
      </div>
      <div className='nav-button menu'>
        <Link className='menu-link' to='/'>Overview</Link>
        <Link className='menu-link' to='/analysis'>Analysis</Link>
        <Link className='menu-link' to='/logs' style={{paddingBottom:'20px'}}>Logs</Link>
      </div>
    </nav>
  )
}