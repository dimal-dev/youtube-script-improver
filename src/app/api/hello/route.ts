import {NextRequest, NextResponse} from 'next/server'
import prisma from "@/lib/db";
import {getMockChatGPTResponse} from "@/services/chatgpt";
import {ID} from "postcss-selector-parser";

type ResponseData = {
    message: string
}

export async function GET(request: NextRequest) {
    await experiments()

    return NextResponse.json({
        message: 'It ran away: ' + Date.now()
    })
}

interface CleanResponse {
    id: string,
    content: string,
}

async function experiments() {
    const id = 1
    const script = await prisma.script.findUnique({
        where: {id}
    })

    const mockData = getMockChatGPTResponse();
    if (!mockData) {
        return;
    }
    const gptResponse = mockData.choices[0].message.content + '\n';
    const regex = /(\[ID\-(?<id>\d+)\])\[Version [123]{1}\](?<content>.*?)\n/g

    const matches = gptResponse.matchAll(regex)
    if (!matches) {
        return;
    }

    const responses: CleanResponse[] = [...matches].map(r => {
        const id = typeof r.groups?.id === 'undefined' ? '' : r.groups.id;
        const content = typeof r.groups?.content === 'undefined' ? '' : r.groups.content.trim();
        return {
            id,
            content
        }
    })

    const responsesGrouped: { [id: string]: CleanResponse[] } = {};
    for (const response of responses) {
        if (!(response.id in responsesGrouped)) {
            responsesGrouped[response.id] = []
        }

        const containsResponseWithSameContent = responsesGrouped[response.id].some(i => i.content === response.content);
        if (!containsResponseWithSameContent) {
            responsesGrouped[response.id].push({...response});
        }
    }

    const scriptLineIdListThatHasImprovements: number[] = []
    for (const id in responsesGrouped) {
        if (!responsesGrouped.hasOwnProperty(id)) {
            continue;
        }
        const subResponses = responsesGrouped[id];
        const toInsert = [];
        for (const subResponse of subResponses) {
            toInsert.push({
                scriptLineId: parseInt(id),
                content: subResponse.content,
            });
        }
        const result = await prisma.scriptLineImprovement.createMany({
            data: toInsert
        });
        if (result.count > 0) {
            scriptLineIdListThatHasImprovements.push(parseInt(id))
        }
    }

    if (scriptLineIdListThatHasImprovements.length > 0) {
        const res = await prisma.scriptLine.updateMany({
            where: {
                id: {in: scriptLineIdListThatHasImprovements}
            },
            data: {
                hasImprovements: true,
            }
        });
        console.log(res);
    }
}