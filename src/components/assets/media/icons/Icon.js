import React from "react";
import Icons from "./icons.svg"; // Path to your icons.svg
import PropTypes from "prop-types";

const Icon = ({ name, color, size }) => (
  <svg
    className={`icon icon-${name}`}
    fill={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <use href={`${Icons}#icon-${name}`} />
  </svg>
);

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  size: PropTypes.number,
};

export default Icon;
