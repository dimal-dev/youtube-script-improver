'use server'
import prisma, {getScriptLinesOutOfSyncCount} from "@/lib/db";
import {notFound} from "next/navigation";
import LinesAndButtons from "@/app/script/[id]/lines-and-buttons";
import {RootLayoutOverridable} from "@/app/layout";

export default async function ScriptPage({params}: { params: Promise<{ id: string }> }) {
    const id = parseInt((await params).id)
    const script = await prisma.script.findUnique({
        where: {id}
    })

    if (!script) {
        notFound();
    }

    const scriptLines = await prisma.scriptLine.findMany({
        where: {
            scriptId: script.id
        },
        include: {
            improvements: true,
        },
        orderBy: [
            {
                id: 'asc'
            }
        ]
    })

    const scriptLinesOutOfSync = await getScriptLinesOutOfSyncCount();

    //buttons
    //lines

    /**
     * Next steps to move buttons in the header:
     * https://stackoverflow.com/questions/60626451/is-using-redux-with-next-js-an-anti-pattern
     * https://github.com/vercel/next.js/tree/canary/examples/with-redux
     *
     * try using redux toolkit
     */

    return (
        <RootLayoutOverridable pageName='View script'>
            <div>
                <div>
                    <div className='text-center'>
                        Shortcuts: 1) cmd + Enter -&gt; save, 2) cmd + click -&gt; use diff
                    </div>
                    <hr/>
                </div>
                <LinesAndButtons script={script} scriptLines={scriptLines} scriptLinesOutOfSyncInitial={scriptLinesOutOfSync}/>
            </div>
        </RootLayoutOverridable>
    )

}