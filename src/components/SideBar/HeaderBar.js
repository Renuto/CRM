import React from "react";
import Logo from "../assets/media/logo/logo-removebg-preview.png";

const HeaderBar = (props) => {
  return (
    <div className="text-center d-flex align-items-center justify-content-center">
      
        {props.isCollapse ? (
          <h1 className="display-6 text-white"><strong>D</strong></h1>
        ) : (
          <a className="" href="index.html">
            <img src={Logo} alt="Logo" width="150px" height="50px" />
          </a>
        )}
      
    </div>
  );
};

export default HeaderBar;
