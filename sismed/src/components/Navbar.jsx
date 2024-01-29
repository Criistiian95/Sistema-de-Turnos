import React, { useEffect } from 'react';
import LogoutButton from './LogoutButton';
import User from './User';
import { useUser, getUserIdFromLocalStorage } from './UserContext';
import logo from "../assets/Sismed-logo.jpg"

function Navbar() {
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!user) {
      const userIdFromLocalStorage = getUserIdFromLocalStorage();

      if (userIdFromLocalStorage) {
        fetch(`http://localhost:3003/api/user/${userIdFromLocalStorage}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.user) {
              setUser(data.user);
              console.log(userIdFromLocalStorage)
            } else {
              console.error('Error al obtener el perfil del usuario desde localStorage:', data.message);
            }
          })
          .catch((error) => {
            console.error('Error al obtener el perfil del usuario desde localStorage:', error);
          });
      } else {
        console.log('No hay userId en localStorage');
      }
    }
  }, [user, setUser]);
  console.log(user);
  return (
    <React.Fragment>

        <nav id="sidebarMenu" className="collapse d-lg-block sidebar collapse bg-secondary">
          <div className="position-sticky" style={{paddingTop: "10px"}}>
            <div className="list-group list-group-flush mx-3 mt-4" style={{gap:"30px"}}>

              <button className='input btn'><a className='link-underline-opacity-0 fw-bolder  text-light text-decoration-none' 
href={`http://localhost:3000/api/user/${user}`}>Home</a></button>

            <button className='input btn ' ><a className='link-underline-opacity-0 fw-bolder text-light text-decoration-none' 
            href="/turnos">Agendar Turnos</a></button>
       
              <button className='input btn ' ><a className='link-underline-opacity-0 fw-bolder text-light text-decoration-none' 
              href="/turns-patients">Buscar Pacientes</a></button>
              
              <button className='input btn'><a className='link-underline-opacity-0 fw-bolder text-light text-decoration-none ' 
              href="/createPatient">Agregar Pacientes</a></button>
              
              <button className='input btn'><a className='link-underline-opacity-0 fw-bolder  text-light text-decoration-none' 
              href="/createDoctor">Agregar Medico</a></button>
              
            </div>
          </div>
        </nav>

        <nav id="main-navbar" className="navbar navbar-expand-lg navbar-light fixed-top">
          <div className="container-logo">
            <button
              className="navbar-toggler"
              type="button"
              data-mdb-toggle="collapse"
              data-mdb-target="#sidebarMenu"
              aria-controls="sidebarMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="fas fa-bars"></i>
              
            </button>
          <a className="navbar-brand" href="/turnos">
        <img
          src={logo}
          height="100px"
          width="240px"
          alt="MDB Logo"
          loading="lazy"
          style={{paddingTop: "20px"}}
        />
      </a>
          </div>
          
        </nav>
        <main style={{ marginTop: "58px" }}>
          <div className="container pt-4"></div>
        </main>
    <nav className='navbar navbar-expand-lg navbar-light fixed-top'>
      
          {user ? (
            
            <ul className='navbar-nav ms-auto d-flex flex-row'>
              
             <div className='container-rigth-1'>
              <li className='nav-item dropdown fw-bolder' ><span className=''>Bienvenido, <User {...user} /></span></li>
              </div>
              <div className='container-rigth-2'>
             <li className='nav-item dropdown'> <LogoutButton /></li>
             </div>
            
            </ul>
            
          ) : (
            <p>Cargando perfil...</p>
          )}
 
        </nav>
    </React.Fragment>
  );
}

export default Navbar;