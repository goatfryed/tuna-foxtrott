import React, {ReactNode} from "react";
import styled from "styled-components";

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

export const VerticalModalContent = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
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