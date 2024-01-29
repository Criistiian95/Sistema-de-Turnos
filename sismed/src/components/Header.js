import { Link } from 'react-router-dom'
import "../assets/App.css"

const Header = () => {
    return (
      <div>
        <nav className='navbar'>
          <Link to="/login" className="lista">Home</Link>
          <Link to="/api/Registro-usuario" className="lista">Registrar Usuario</Link>
        </nav>
      </div>
    );
  }
  
  export default Header;