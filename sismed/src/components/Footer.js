import React from "react";
import "../assets/Footer.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faFacebook} from "@fortawesome/free-brands-svg-icons"
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import {faPhone} from "@fortawesome/free-solid-svg-icons"



function Footer() {
    return (
        <footer className="text-center" style={{ backgroundColor: "#AAF3E0" }}>
            <div className="container p-4 pb-0">
                <div className="container">
                <section className="mb-4">
                    <a
                        data-mdb-ripple-init
                        className="btn text-white btn-floating m-1"
                        style={{ backgroundColor: "#3b5998" }}
                        href="https://www.instagram.com/disenos__ls/"
                        role="button"
                    ><FontAwesomeIcon icon={faFacebook}/>
                    </a>
                    <a
                        data-mdb-ripple-init
                        className="btn text-white btn-floating m-1"
                        style={{ backgroundColor: "#ac2bac" }}
                        href="https://www.instagram.com/disenos__ls"
                        role="button"
                    ><FontAwesomeIcon icon={faInstagram}/>
                    </a>

                    <a
                        data-mdb-ripple-init
                        className="btn text-white btn-floating m-1"
                        style={{ backgroundColor: "#dd4b39" }}
                        href="https://web.whatsapp.com/"
                        role="button"
                    ><FontAwesomeIcon icon={faPhone}/>
                    </a>
                </section>
                </div>
          
            <div className=" p-3" style={{ backgroundColor: "rgba(0, 0, 0, 0.05);" }}>
                <span>© 2020 Copyright </span>
                <br/>
                <a className="text-body" href="https://www.instagram.com/disenos__ls"> Diseños L&S &reg;</a>
            </div>
            </div>
        </footer>
    );
}

export default Footer;