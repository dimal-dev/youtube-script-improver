'use client'

import Prisma from '@prisma/client'
import pullHandler from "@/app/script/[id]/pullHandler";

export default function Buttons({scriptId, scriptBlockId}: {scriptId: number, scriptBlockId: string}) {

    const pullButtonHandler = async () => {
        const reloadPage = await pullHandler(scriptId, scriptBlockId);
        if (reloadPage) {
            window.location.reload()
        }
    }

    return (
        <div className='flex gap-4 justify-center'>
            <button onClick={pullButtonHandler} disabled={true} className="px-4 py-1 inline-flex flex-col justify-center items-center bg-blue-500      rounded-lg cursor-pointer select-none
                    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                    active:border-b-[0px]
                    transition-all duration-150 [box-shadow:0_5px_0_0_#1b6ff8,0_8px_0_0_#1b70f841]
                    border-b-[1px] border-blue-400
                  ">
                    <span
                        className="flex flex-col justify-center items-center h-full text-white font-bold text-lg ">
                        Pull from Notion
                    </span>
            </button>
            <button className="px-4 py-1 inline-flex flex-col justify-center items-center bg-green-500      rounded-lg cursor-pointer select-none
                    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                    active:border-b-[0px]
                    transition-all duration-150 [box-shadow:0_5px_0_0_#2cd168,0_8px_0_0_#1b70f841]
                    border-b-[1px] border-green-400
                  ">
                    <span
                        className="flex flex-col justify-center items-center h-full text-white font-bold text-lg ">
                        Push to Notion
                    </span>
            </button>
        </div>
    )
}