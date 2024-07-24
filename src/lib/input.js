import React from "react";
import { components } from "react-select";

// Function is a React component that wraps around react-select's Input component and adds a `maxLength` property to it. We use it for select components like "Rules" and "Status".
export default function CustomInput(props) {
  const { maxLength } = props.selectProps;
  const inputProps = { ...props, maxLength };
  return <components.Input {...inputProps} />;
}
