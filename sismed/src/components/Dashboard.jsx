import React from 'react';
import { useParams } from "react-router-dom";
import "../assets/Home.css";
import "../assets/App.css"
import StateTurns from './StateTurns.js';
import Navbar from './Navbar.jsx';

function Dashboard() {
  const { userId } = useParams();

  return (
    <React.Fragment>

      <section  style={{ backgroundColor: "#AAF3E0" }}>
        <div className="container py-5 h-100">
          <Navbar userId={userId} />
          <div className='row d-flex justify-content-center align-items-center h-100'>
          <div className='col col-xl-10'>
          <div className='card card-Dash' style={{ borderRadius:"1rem", paddingTop:"10px" }}>
            <div className='justify-content-center d-flex'>


              <StateTurns />

            </div>
            </div>
            </div>
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

export default Dashboard;