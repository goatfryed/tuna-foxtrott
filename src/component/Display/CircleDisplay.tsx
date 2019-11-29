import React from "react";
import styled from "styled-components";
import * as CSS from "csstype";

const CircleItem = styled.div<{
    itemSize: CSS.WidthProperty<string>,
    circleSize: CSS.WidthProperty<string>,
    angle: number
}>`
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${props => props.itemSize};
    height: ${props => props.itemSize};
    margin: calc(-${props => props.itemSize}/2);
    
    transform:
        rotate(${props => props.angle}deg)
        translate(calc(${props => props.circleSize} / 2 - ${props => props.itemSize}/2))
        rotate(-${props => props.angle}deg)
    ;
`;

const CircleContainer = styled.div<{
    circleSize: CSS.WidthProperty<string>,
}>`
  position: relative;
  width: ${props => props.circleSize};
  height: ${props => props.circleSize};
  padding: 0;
  border-radius: 50%;
  list-style: none;
`;

export function CircleDisplay(props: {
    children: React.ReactNodeArray,
    circleSize: CSS.WidthProperty<string>
    itemSize: CSS.WidthProperty<string>
}) {
    const steps = 360 / props.children.length;

    return <CircleContainer circleSize={props.circleSize}>
        {props.children.map((child,index) => <CircleItem
            circleSize={props.circleSize}
            itemSize={props.itemSize || "1em"}
            angle={(index * steps) + 315}
            >{child}
        </CircleItem>)}
    </CircleContainer>
}