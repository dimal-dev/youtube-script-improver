'use server';
import notion from "@/lib/notion";
import Prisma from '@prisma/client';
import {ScriptLineState} from '@/lib/db'
import prismaDB from '@/lib/db'
import {
    BlockObjectResponse,
    ParagraphBlockObjectResponse,
    PartialBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

// const pageId = '14bfadbb073f8101ba08d4ff2ed78eb5';

export type Line = { blockId: string, text: string }


const isParagraph = (item: PartialBlockObjectResponse | BlockObjectResponse): item is ParagraphBlockObjectResponse => {
    return 'type' in item && item.type === 'paragraph' && 'paragraph' in item;
}

const loadNotionEntries = async (blockId: string): Promise<Line[]> => {
    const allEntries = [];
    let nextIterationCursor = null
    let hasMore = false;
    do {
        let params: {
            block_id: string;
            start_cursor?: string;
        }
        if (typeof nextIterationCursor === "string") {
            params = {
                block_id: blockId,
                start_cursor: nextIterationCursor
            }
        } else {
            params = {
                block_id: blockId,
            }
        }
        const res = await notion.blocks.children.list(params);
        const {results, next_cursor} = res
        const scriptEntries = results.filter((item: PartialBlockObjectResponse | BlockObjectResponse): item is ParagraphBlockObjectResponse => {
            if (!isParagraph(item)) {
                return false
            }

            const richText = item.paragraph.rich_text;
            if (richText && richText.length > 1) {
                return richText.some(rtItem => {
                    if (rtItem.type === "text") {
                        return rtItem.text.content === "[📝 S]"
                    }
                })
            }
            return false
        });
        const scriptEntriesClean = scriptEntries.map((item: ParagraphBlockObjectResponse) => {
            const blockId = item.id;
            let text = '';

            const richText = item.paragraph.rich_text;
            for (const entry of richText) {
                if (entry.type === "text" && entry.text.content !== "[📝 S]") {
                    text = entry.text.content
                }
            }

            return {
                blockId, text
            }
        });
        allEntries.push(...scriptEntriesClean);
        nextIterationCursor = next_cursor

        hasMore = res.has_more;
    } while (hasMore)

    return allEntries;
}

export default async function notionPullHandler(scriptId: number, scriptBlockId: string): Promise<boolean> {
    const lines = await loadNotionEntries(scriptBlockId);
    const linesToInsert = [];
    for (const line of lines) {
        linesToInsert.push({
            scriptId,
            notionBlockId: line.blockId,
            content: line.text,
            state: ScriptLineState.IN_SYNC_WITH_NOTION
        })
    }

    const rowsInserted = await prismaDB.scriptLine.createMany({
        data: linesToInsert
    });

    return rowsInserted.count > 0;
}