import React from "react";
import styles from "./HeaderBar.module.css";

const HeaderBar = (props) => {
  return (
    <div className="text-center d-flex align-items-center justify-content-center mt-3 mb-2">
      {props.isCollapse ? (
        <h1 className={`${styles['logo']} display-6 text-white`}>
          <i class="bx bxs-doughnut-chart"></i>
        </h1>
      ) : (
        <div
          className={`${styles["logo-name"]} d-flex align-items-center me-4 pe-2`}
        >
          <i className="bx bxs-doughnut-chart bx-md me-1"></i> DataCog
        </div>
      )}
    </div>
  );
};

export default HeaderBar;
