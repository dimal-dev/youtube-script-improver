'use server'

import prisma from '@/lib/db'
import {getLogDirectoryPath, getRootPath, smartLog} from "@/lib/utilServer";
import {getLastGPTResponse, improve, processResponse} from "@/lib/chatgpt";

export default async function askChatGPTForScriptImprovements(scriptLineIDs: number[]) {
    const scriptLines = await prisma.scriptLine.findMany({
        where: {
            id: {
                in: scriptLineIDs
            }
        },
        orderBy: [
            {
                id: 'asc'
            }
        ]
    });

    let lines = scriptLines.filter(line => !!line.content)

    const from = 149;
    const batchSize = 50;
    let linesCopy = scriptLines.filter(line => line.id > from);
    let linesSlice1 = linesCopy.splice(0, batchSize);

    let i = 0;

    while(linesCopy.length > 0) {
        i++;
        let linesSlice = linesCopy.splice(0, batchSize);
        if (linesCopy.length < (batchSize / 2)) {
            linesSlice = [...linesSlice, ...linesCopy];
            linesCopy = [];
        }

        await improve(linesCopy as {id: number, content: string}[])

        smartLog(linesSlice, 'linesSlice_' + i)
        smartLog(linesCopy.length, 'linesCopy.length_' + i);
    }

    // smartLog(linesSlice1, 'linesSlice1')
    // smartLog(linesCopy.length, 'linesCopy.length');


    // console.log(lin)
    // lines = scriptLines.filter(line => line.id > from && line.id < from + batchSize);

    // smartLog(lines);
    // return false;
    // await improve(lines as {id: number, content: string}[]);

    return true;
}