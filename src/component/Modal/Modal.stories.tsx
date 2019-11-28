import {Modal} from "./index";
import {action} from "@storybook/addon-actions";
import React from "react";

export default {
    title: "Modal",
}

export function standard() {
    return <Modal onBackground={action("onBackground")}>
        <div className="modal-card">
            <div className="modal-card-body">This is an awesome modal</div>
        </div>
    </Modal>
}