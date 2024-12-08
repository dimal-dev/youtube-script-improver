'use server'

import notion from "@/lib/notion";
import prisma, {ScriptLineState, getScriptLinesOutOfSyncCount} from '@/lib/db'

export default async function notionPushHandler(scriptId: number) {
    const lineToSync = await prisma.scriptLine.findFirst({
        where: {
            scriptId,
            state: ScriptLineState.MODIFIED
        },
        orderBy: [
            {id: 'asc'}
        ]
    });

    if (!lineToSync) {
        return 0;
    }

    const res = await notionUpdate(lineToSync.notionBlockId ?? '', lineToSync.content ?? '');
    await prisma.scriptLine.update({
        where: {
            id: lineToSync.id,
        },
        data: {
            state: ScriptLineState.IN_SYNC_WITH_NOTION
        }
    })

    console.log(JSON.stringify(res));

    return getScriptLinesOutOfSyncCount();
}

async function notionUpdate(blockId: string, newContent: string) {
    return await notion.blocks.update({
        "block_id": blockId,

        "paragraph": {
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": "[📝 S]",
                    },
                    "annotations": {
                        "code": true,
                    }
                },
                {
                    "text": {
                        "content": ' ' + newContent,
                        "link": null
                    },
                }
            ],
            "color": "default"
        }
    })
}