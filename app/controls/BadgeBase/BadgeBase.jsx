import PropTypes from "prop-types";
import React from "react";
import { ArrowRight } from "../../icons/ArrowRight";
import { ArrowUp } from "../../icons/ArrowUp";
import { Au } from "../../icons/Au";
import { Plus } from "../../icons/Plus";
import { X } from "../../icons/X";
import { Dot } from "../Dot";
import "./style.css";

export const BadgeBase = ({ icon, className, textClassName, text = "Label" }) => {
  return (
    <div className={`badge-base icon-${icon} ${className}`}>
      {["false", "icon-right", "x-close"].includes(icon) && <div className="text">{text}</div>}

      {icon === "dot" && <Dot className="instance-node" dotClassName="dot-instance" size="sm" />}

      {icon === "country" && <Au className="AU" />}

      {["country", "dot"].includes(icon) && <div className={`text ${textClassName}`}>{text}</div>}

      {icon === "avatar" && (
        <>
          <div className="avatar" />
          <div className={`text ${textClassName}`}>{text}</div>
        </>
      )}

      {icon === "x-close" && <X className="instance-node-2" />}

      {icon === "icon-right" && <ArrowRight className="instance-node-2" />}

      {icon === "icon-left" && (
        <>
          <ArrowUp className="instance-node-2" />
          <div className={`text ${textClassName}`}>{text}</div>
        </>
      )}

      {icon === "only" && <Plus className="instance-node-2" />}
    </div>
  );
};

BadgeBase.propTypes = {
  icon: PropTypes.oneOf(["icon-right", "country", "only", "avatar", "false", "dot", "icon-left", "x-close"]),
  text: PropTypes.string,
};
