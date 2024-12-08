'use client'

import notionPullHandler from "@/app/script/[id]/notionPullHandler";
import {SetStateAction, useState} from "react";
import notionPushHandler from "@/app/script/[id]/notionPushHandler";
import {doRemoteWork} from "@/lib/util";
import askChatGPTForScriptImprovements from "@/app/script/[id]/askChatGPTForScriptImprovements";

export default function Buttons({scriptId, scriptBlockId, scriptLinesOutOfSync, setScriptLinesOutOfSync, getCheckedLineIds}: {
    scriptId: number,
    scriptBlockId: string,
    scriptLinesOutOfSync: number,
    setScriptLinesOutOfSync: (state: SetStateAction<number>) => void,
    getCheckedLineIds: () => number[]
}) {
    const [pushing, setPushing] = useState(false)
    const [pulling, setPulling] = useState(false)
    const [syncingWithGPT, setSyncingWithGPT] = useState(false)
    const [scriptLinesRemainForPush, setScriptLinesRemainForPush] = useState(-1)

    const pullButtonHandler = async () => {
        const worker = async () => {
            const reloadPage = await notionPullHandler(scriptId, scriptBlockId);
            if (reloadPage) {
                window.location.reload()
            }
        };

        await doRemoteWork(worker, setPulling, 500)
    }

    let pushToNotionButtonContent = null;
    let needsSync = false;
    if (pushing && scriptLinesRemainForPush > 0) {
        pushToNotionButtonContent = (
            <>
                Pushing to Notion, left: {scriptLinesRemainForPush}
            </>
        );
    } else if (scriptLinesOutOfSync > 0) {
        needsSync = true
        pushToNotionButtonContent = (
            <>
                Push to sync with Notion. Lines out of sync: {scriptLinesOutOfSync}
            </>
        );
    } else {
        pushToNotionButtonContent = (
            <>
                In sync with Notion
            </>
        )

    }

    return (
        <div className='flex gap-4 justify-center'>
            <button onClick={pullButtonHandler} disabled={pulling} className="px-4 py-1 inline-flex flex-col justify-center items-center bg-blue-500      rounded-lg cursor-pointer select-none
                    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                    active:border-b-[0px]
                    transition-all duration-150 [box-shadow:0_5px_0_0_#1b6ff8,0_8px_0_0_#1b70f841]
                    border-b-[1px] border-blue-400 disabled:opacity-50 disabled:pointer-events-none
                  ">
                    <span
                        className="flex flex-col justify-center items-center h-full text-white font-bold text-lg ">
                        Pull from Notion
                    </span>
            </button>
            <button type="button"
                    className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={syncingWithGPT}
                    onClick={async () => {
                        const checkedLineIds = getCheckedLineIds();
                        if (checkedLineIds.length < 1) {
                            return;
                        }

                        doRemoteWork(async () => {
                            const res = await askChatGPTForScriptImprovements(checkedLineIds);
                            if (res) {
                                window.location.reload();
                            }
                        }, setSyncingWithGPT, 500)
                    }}

            >Ask ChatGPT
            </button>
            <button className="px-4 py-1 inline-flex flex-col justify-center items-center bg-green-500      rounded-lg cursor-pointer select-none
                    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                    active:border-b-[0px]
                    transition-all duration-150 [box-shadow:0_5px_0_0_#2cd168,0_8px_0_0_#1b70f841]
                    border-b-[1px] border-green-400 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={pushing || !needsSync}
                    onClick={async () => {
                        if (pushing) return;

                        const syncOneMore = async () => {
                            const res = await notionPushHandler(scriptId);
                            setScriptLinesRemainForPush(res);

                            if (res > 0) {
                                return await syncOneMore();
                            } else {
                                setScriptLinesOutOfSync(0)
                            }
                        }

                        doRemoteWork(async () => {
                            await syncOneMore();
                        }, setPushing, 500)
                    }}
            >
                    <span className="flex flex-col justify-center items-center h-full text-white font-bold text-lg "
                    >
                        {pushToNotionButtonContent}
                    </span>
            </button>
        </div>
    )
}