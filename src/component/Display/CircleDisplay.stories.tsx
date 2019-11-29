import {CircleDisplay} from "./CircleDisplay";
import React from "react";
import styled from "styled-components";
import {number} from "@storybook/addon-knobs";

export default {
    title: "Circle Display",
    component: CircleDisplay,
}

const Dot = styled.div`
  border-radius: 50%;
  background-color: red;
  height: 1em;
  width: 1em;
  color: white;
  text-align: center;
  vertical-align: middle;
  line-height: 1;
`;


export function standard() {
    const childCount = number("childCount", 7, {min: 1, step: 1, max: 20});
    const children = [];
    for (let i = 0; i < childCount; i++) {
        children.push(<Dot key={i}>{i}</Dot>)
    }
    return <CircleDisplay circleSize="5em" itemSize="1em">
        {children}
    </CircleDisplay>
}