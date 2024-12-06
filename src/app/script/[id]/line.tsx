'use client'

import Prisma from '@prisma/client'
import {stringDiff} from "@/lib/stringDiff";
import DiffMatchPatch from "diff-match-patch";
import Improvement from "@/app/script/[id]/improvement";
import {useState, useRef} from "react";
import saveScriptLineHandler from "@/app/script/[id]/saveScriptLineHandler";
import deleteScriptImprovements from "@/app/script/[id]/deleteScriptImprovements";


export default function Line(
    {scriptLine, i}: { scriptLine: Prisma.ScriptLine & { improvements: Prisma.ScriptLineImprovement[] }, i: number }
) {
    const [initialContent, setInitialContent] = useState<string>(scriptLine.content ?? '');
    const [originalContent, setOriginalContent] = useState<string>(scriptLine.content ?? '');
    const [edit, setEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [scriptLineImprovements, setScriptLineImprovements] = useState(scriptLine.improvements);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const whenHasImprovementsClassname = scriptLine.hasImprovements ? 'hover:cursor-pointer' : '';
    const extraEmoji = scriptLineImprovements.length > 0 ? '📝┋' : '';

    let improvementsList = null;
    if (scriptLineImprovements.length > 0) {
        let letterNumber = 0;

        improvementsList = scriptLineImprovements.map((improvement) => {
            return (
                <Improvement key={improvement.id} original={originalContent} letterNumber={letterNumber++}
                             improvement={improvement} setOriginalContent={setOriginalContent}/>
            )
        })
    }

    let modified = null;
    let revert = null;
    if (initialContent !== originalContent) {
        modified = '🔵'
        revert = <span className='mx-1 hover:cursor-pointer' onClick={() => setOriginalContent(initialContent)}>❎</span>
    }

    let content;
    const startTextEdit = () => {
        if (!edit) {
            setEdit(true)
            setTimeout(() => {
                const current = textAreaRef.current;
                if (current) {
                    current.setSelectionRange(originalContent.length, originalContent.length);
                    current.focus();
                }
            })
        }
    }

    const saveOriginalContent = async (newContent?: string) => {
        if (!modified) {
            return;
        }

        const start = Date.now()
        setSaving(true);

        try {
            const contentToSave = newContent ? newContent : originalContent;
            const res = await saveScriptLineHandler(scriptLine.id, contentToSave);
            setInitialContent(originalContent);
        } catch (e) {
            console.error(e);
        }
        const minDelayMilliseconds = 300
        const diff = minDelayMilliseconds - (Date.now() - start)
        const delay = diff ? diff : 0
        setTimeout(() => setSaving(false), delay)
    };

    if (edit) {
        content = (
            <textarea className='w-full resize-none' value={originalContent} ref={textAreaRef}
                      onChange={(e) => setOriginalContent(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.metaKey && (e.key === 'Enter' || e.keyCode === 13)) {
                              setOriginalContent(e.target.value);
                              saveOriginalContent(e.target.value);
                              setEdit(false)
                          }
                      }}
                      onBlur={() => setEdit(false)}
            ></textarea>
        )
    } else {
        content =
            <div onClick={startTextEdit}>
                {originalContent}
            </div>
    }

    let completeButton = (
        <div className={scriptLineImprovements.length > 0 ? 'visible' : 'invisible  h-0'}>
            <button type="button"
                    className={
                        `text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2  disabled:opacity-50 disabled:pointer-events-none`}
                    disabled={completing}
                    onClick={async () => {
                        const start = Date.now()
                        setCompleting(true);

                        try {
                            if (modified) {
                                await saveScriptLineHandler(scriptLine.id, originalContent);
                            }
                            await deleteScriptImprovements(scriptLine.id);

                            setInitialContent(originalContent);
                            setScriptLineImprovements([]);
                        } catch (e) {
                            console.error(e);
                        }
                        const minDelayMilliseconds = 300
                        const diff = minDelayMilliseconds - (Date.now() - start)
                        const delay = diff ? diff : 0
                        setTimeout(() => setCompleting(false), delay)
                    }}
            >
                Complete
            </button>
        </div>
    )

    let saveButton = (
        <div className={modified ? 'visible' : 'invisible h-0'}>
            <button
                className={`rounded relative inline-flex group items-center justify-center px-5 py-2.5 cursor-pointer border-b-4 border-l-2 active:border-sky-600 active:shadow-none shadow-lg bg-gradient-to-tr from-sky-600 to-sky-500 border-sky-700 text-white disabled:opacity-50 disabled:pointer-events-none`}
                disabled={saving}
                data-prokeyscachednode="false"
                onClick={saveOriginalContent}
            >
                        <span
                            className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white group-hover:w-full group-hover:h-full opacity-10"></span>
                <span className="relative">Save&nbsp;{modified}</span>
            </button>
        </div>
    )

    return (
        <li className={`pl-3 py-3 border-b-2 flex`}>
            <div className='flex-grow'>
                <div className={whenHasImprovementsClassname + ' flex'}>
                    <div className='w-max text-nowrap'>
                        {revert}
                        <span className='text-cyan-700'>
                            {i}┋{extraEmoji}
                        </span>
                    </div>
                    <div className='flex-grow'>
                        {content}
                    </div>
                </div>
                <div className='pl-14'>
                    {improvementsList}
                </div>
            </div>
            <div className='flex justify-center flex-col gap-3 border-l-2 pl-3'>
                {completeButton}
                {saveButton}
            </div>
        </li>
    )
}