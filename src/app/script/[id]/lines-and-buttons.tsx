'use client'
import Buttons from "@/app/script/[id]/buttons";
import Line from "@/app/script/[id]/line";
import Prisma from '@prisma/client'
import {useState, createContext, useContext, Dispatch, SetStateAction, useEffect, memo, useCallback} from "react";

export const ScriptLinesOutOfSyncSetterContext = createContext((state: number) => {});

const LineMemoized = memo(Line)

const checkedLines = new Set<number>();

export default function LinesAndButtons({script, scriptLines, scriptLinesOutOfSyncInitial}: {
    script: Prisma.Script,
    scriptLines: (Prisma.ScriptLine & { improvements: Prisma.ScriptLineImprovement[] })[],
    scriptLinesOutOfSyncInitial: number
}) {
    const [scriptLinesOutOfSync, setScriptLinesOutOfSync] = useState(scriptLinesOutOfSyncInitial)
    const [, setUpdateLines] = useState(0)

    useEffect(() => {
        checkedLines.clear()
    }, []);

    let buttons = null;
    if (script.notionBlockId) {
        buttons = <Buttons scriptId={script.id} scriptBlockId={script.notionBlockId}
                           scriptLinesOutOfSync={scriptLinesOutOfSync}
                           setScriptLinesOutOfSync={setScriptLinesOutOfSync}
                           getCheckedLineIds={() => {
                               return [...checkedLines]
                           }}
        />
    }

    let i = 1;

    const setChecked = useCallback((lineId: number, checked: boolean) => {
        if (checked) {
            checkedLines.add(lineId)
        } else {
            checkedLines.delete(lineId)
        }

        setUpdateLines((prev) => prev + 1)
    }, [])

    const lines = scriptLines.map(scriptLine =>
        <LineMemoized key={scriptLine.id} scriptLine={scriptLine} i={i++} checkedLines={checkedLines} checked={checkedLines.has(scriptLine.id)} setChecked={setChecked}/>
    )

    return (
        <ScriptLinesOutOfSyncSetterContext.Provider value={setScriptLinesOutOfSync}>
            <div>
            </div>
            <div className='text-center py-5 flex gap-4 justify-center items-center pb-5'>
                <a href={script.url ?? undefined} target='_blank' className='text-center text-xl overline'>
                    This is {script.title} [{script.id}]
                </a>
                {buttons}
            </div>
            <hr/>
            <ul className='max-w-screen-lg m-auto mt-5'>
                <li className='pl-3 py-3 border-b-2'>
                    <button onClick={() => {
                        for (const line of scriptLines) {
                            checkedLines.add(line.id)
                        }
                        setUpdateLines((prev) => prev + 1)
                    }}>
                        Check all
                    </button>
                    ┋
                    <button onClick={() => {
                        for (const line of scriptLines) {
                            checkedLines.delete(line.id)
                        }
                        setUpdateLines((prev) => prev + 1)
                    }}>
                        Uncheck all
                    </button>
                </li>
                {lines}
            </ul>
        </ScriptLinesOutOfSyncSetterContext.Provider>
    )
}