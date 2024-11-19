import {ElNotification} from "element-plus";

export function notifySuccess(msg: string): void {
    ElNotification.success(msg)
}

export function notifyError(msg: string): void {
    ElNotification.error(msg);
}