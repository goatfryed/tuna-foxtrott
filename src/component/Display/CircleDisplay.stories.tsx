import {CircleDisplay} from "./CircleDisplay";
import React from "react";
import styled from "styled-components";

export default {
    title: "Circle Display",
    component: CircleDisplay,
}

const Dot = styled.div`
  border-radius: 50%;
  background-color: red;
  height: 100%;
  width: 100%;
  color: white;
  text-align: center;
  vertical-align: middle;
  line-height: 1;
`;


export function standard() {
    const childCount = 9;
    const children = [];
    for (let i = 0; i < childCount; i++) {
        children.push(<Dot key={i}>{i}</Dot>)
    }
    return <CircleDisplay circleSize="12em" itemSize="2.5em">
        {children}
    </CircleDisplay>
}