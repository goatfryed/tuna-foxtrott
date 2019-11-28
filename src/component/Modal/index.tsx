import React, {ReactNode} from "react";

interface ModalProps {
    children: ReactNode,
    onBackground: () => void,
}

export function Modal (props: ModalProps) {
    return <div className="modal is-active">
        <div className="modal-background" onClick={props.onBackground} />
        {props.children}
    </div>
}