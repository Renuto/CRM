import React from "react";
import Avatar from "../assets/media/avatar/150-26.jpg";
import styles from "./User.module.css";

const User = () => {
  return (
    <div
      className="d-flex align-items-center mb-10"
      id="kt_header_user_menu_toggle"
    >
      {/* <!--begin::Menu wrapper--> */}
      <div
        className={`${styles["cursor-pointer"]} ${styles["symbol"]}`}
        data-kt-menu-trigger="click"
        data-kt-menu-overflow="true"
        data-kt-menu-placement="top-start"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        data-bs-dismiss="click"
        title="User profile"
      >
        <img src={Avatar} alt="User" />
      </div>
      {/* <!--begin::Menu--> */}

      {/* <!--end::Menu-->
        <!--end::Menu wrapper--> */}
    </div>
  );
};

export default User;
