import React from 'react';

function LogoutButton() {
  const handleLogout = async () => {
    try {

      localStorage.removeItem('token');

      // Establece una nueva cookie con un tiempo de expiración pasado
      
      

      // Envía una solicitud al servidor para cerrar la sesión del usuario
      const response = await fetch(`http://localhost:3003/api/user/logout`, {
                method: 'POST',
                credentials:"include",
                headers: {
                    'Content-Type': 'application/json',
                }
      });

      if (response.ok) {
        // El usuario cierra la sesión, puedes redirigirlo a la página de inicio o a donde desees
        console.log("sesion cerrada")
        
        window.location.href = '/login'; // Redirige a la página de inicio de sesión
       
      } else {
        // Maneja el error de cierre de sesión
        console.error('El cierre de sesión falló');
      }
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
    
  };
  console.log("cookie", localStorage)
  return (
    <div className=' justify-content py-5 h-100'>
    <p>
    <button className='btn btn-success btn-lg'  onClick={handleLogout}>Cerrar Sesión</button>
    </p>
    </div>
  );
}

export default LogoutButton;