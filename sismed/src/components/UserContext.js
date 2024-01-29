import React, { createContext, useContext, useState, useEffect } from 'react';

// Utilidad para obtener el ID del usuario desde localStorage
export const getUserIdFromLocalStorage = () => {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  };
  
  const UserContext = createContext();
  
  export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const userId = getUserIdFromLocalStorage();
  
      if (userId) {
        fetch(`http://localhost:3003/api/user/${userId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.user) {
              setUser(data.user);
            } else {
              console.error('Error al obtener el perfil del usuario:', data.message);
            }
          })
          .catch((error) => {
            console.error('Error al obtener el perfil del usuario:', error);
          });
      }
    }, []);
  
    return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    );
  };
  
  export const useUser = () => {
    return useContext(UserContext);
  };