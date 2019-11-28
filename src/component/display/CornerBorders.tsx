import styled, {css} from "styled-components";
import * as CSS from "csstype";
import * as React from "react";

interface CornerBorderProps {
    borderSize?: CSS.WidthProperty<string>
    borderWidth?: CSS.WidthProperty<string>
}

const CornerBordersBaseCss = css<CornerBorderProps>`
    content: "";
    position: absolute;
    border-width: ${props => props.borderWidth ?? "2px"};
    width: ${props => props.borderSize ?? "1em"};
    height: ${props => props.borderSize ?? "1em"};
`;
const CornerBordersAbove = styled.div<CornerBorderProps>`
    position: relative;
    height: 100%;
    &:first-child:before {
        ${CornerBordersBaseCss};
        top: 0; left: 0;
        border-style: solid none none solid;
        border-radius: 25% 0 0 0;
    }
    &:first-child:after {
        ${CornerBordersBaseCss};
        top: 0; right: 0;
        border-style: solid solid none none;
        border-radius: 0 25% 0 0;
    }
`; CornerBordersAbove.displayName = "CornerBordersAbove";
const CornerBordersBelow = styled.div<CornerBorderProps>`
    position: relative;
    height: 100%;
    &:before {
        ${CornerBordersBaseCss};
        bottom: 0; left: 0;
        border-style: none none solid solid;
        border-radius: 0 0 0 25% ;
    }
    &:after {
        ${CornerBordersBaseCss};
        bottom: 0; right: 0;
        border-style: none solid solid none;
        border-radius: 0 0 25% 0;
    }
`; CornerBordersBelow.displayName = "CornerBordersBelow";

export const CornerBorders: React.FC<{ className?: string, padding?: CSS.PaddingProperty<string> } & CornerBorderProps> = (props) => {

    const {
        borderWidth = "2px",
        borderSize = "1em",
        padding = "0em",
        ...otherProps
    } = props;

    return <div {...otherProps}>
        <CornerBordersAbove {...{borderWidth, borderSize}}/>
        <div style={{padding: `calc(${padding} + ${borderWidth})`}}>{props.children}</div>
        <CornerBordersBelow {...{borderWidth, borderSize}}/>
    </div>
};