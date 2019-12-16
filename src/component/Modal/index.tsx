import React, {ReactNode} from "react";
import styled from "styled-components";
import {FlexColumnCentered} from "App/component/Basic/FlexBox";

interface ModalProps {
    children: ReactNode,
    onBackground?: () => void,
}

export function Modal (props: ModalProps) {
    return <div className="modal is-active">
        <div className="modal-background" onClick={props.onBackground} />
        {props.children}
    </div>
}

export const VerticalModalContent = styled(FlexColumnCentered)`
    position: relative;
    background-color: white;
    width: fit-content;
    min-width: 20vw;
    padding: 1em;
`;

export function VerticalContentModal(
    props:
        ModalProps & {className?: string}
) {
    const {
        children,
        className,
        ...modalProps
    } = props;
    return <Modal {...modalProps}>
        <VerticalModalContent className={className}>{props.children}</VerticalModalContent>
    </Modal>
}