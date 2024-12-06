'use server'
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import pullHandler from "@/app/script/[id]/pullHandler";
import Buttons from "@/app/script/[id]/buttons";
import {block} from "sharp";
import Line from "@/app/script/[id]/line";
import DiffMatchPatch from 'diff-match-patch';

import {test} from "@/services/chatgpt";

export default async function ScriptPage({params}: { params: Promise<{ id: string }> }) {
    const id = parseInt((await params).id)
    const script = await prisma.script.findUnique({
        where: {id}
    })

    if (!script) {
        notFound();
    }
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main('This is what we will create in this part of the course. (Updated) More cool content. No way 2', 'In this part of the course, we will create an exciting project together!');
    dmp.diff_cleanupSemantic(diff)
    console.log(diff);



    const scriptLines = await prisma.scriptLine.findMany({
        include: {
            improvements: true,
        },
        orderBy: [
            {
                id: 'asc'
            }
        ]
    })
    let i = 1;
    const lines = scriptLines.map(scriptLine => <Line key={scriptLine.id} scriptLine={scriptLine} i={i++}/>)

    let prompt = '';

    for (const line of scriptLines) {
        prompt += `[ID-${line.id}] ${line.content}\n`;
    }


    // test();


    let buttons = null;
    if (script.notionBlockId) {
        buttons = <Buttons scriptId={script.id} scriptBlockId={script.notionBlockId}/>
    }

    return (
        <div>
            <div className='text-center py-5 flex gap-4 justify-center items-center pb-5'>
                <a href={script.url} target='_blank' className='text-center text-xl overline'>
                    This is {script.title} [{script.id}]
                </a>
                {buttons}
            </div>
            <hr />
            <div className='text-center'>
                Shortcuts: 1) cmd + Enter -> save, 2) cmd + click -> use diff
            </div>
            <hr/>
            <ul className='max-w-screen-lg m-auto mt-5'>
                {lines}
            </ul>
        </div>
    )

}