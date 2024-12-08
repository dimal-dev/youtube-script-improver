import {SetStateAction} from "react";


export async function doRemoteWork<T>(
    workDoer: () => Promise<T>,
    workInProgressStateChanger: (value: SetStateAction<boolean>) => void,
    minDelayMilliseconds: number = 300
) {
    const start = Date.now()
    workInProgressStateChanger(true)

    try {
        return await workDoer();
    } catch (e) {
        console.error(e);
    } finally {
        const diff = minDelayMilliseconds - (Date.now() - start)
        const delay = diff ? diff : 0
        setTimeout(() => workInProgressStateChanger(false), delay)
    }
}