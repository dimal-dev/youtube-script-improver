import Image from "next/image";
import prisma from "@/lib/db";
import notion from "@/lib/notion";
import Link from "next/link";
import {list} from "postcss";
import {
    BlockObjectResponse,
    ParagraphBlockObjectResponse,
    PartialBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

const pageId = '14bfadbb073f8101ba08d4ff2ed78eb5';

type Line = { blockId: string, text: string }


const isParagraph = (item: PartialBlockObjectResponse | BlockObjectResponse): item is ParagraphBlockObjectResponse => {
    return 'type' in item && item.type === 'paragraph' && 'paragraph' in item;
}

const loadNotionEntries = async (pageId: string): Promise<Line[]> => {
    const allEntries = [];
    let nextIterationCursor = null
    do {
        let params: {
            block_id: string;
            start_cursor?: string;
        }
        if (typeof nextIterationCursor === "string") {
            params = {
                block_id: pageId,
                start_cursor: nextIterationCursor
            }
        } else {
            params = {
                block_id: pageId,
            }
        }
        console.log(params)
        const res = await notion.blocks.children.list(params);
        console.log(res)
        const {results, has_more, next_cursor} = res
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
        allEntries.push(...scriptEntriesClean)
        console.log('iteration')
        console.log(next_cursor)
        console.log(has_more)
        console.log(allEntries.length)
        if (!has_more) break;
        nextIterationCursor = next_cursor
    } while (true)

    return allEntries;
}

export default async function Home() {
    // const allEntries = await loadNotionEntries(pageId)
    const allEntries: Line[] = [];

    const responseJson = JSON.stringify(allEntries)

    const list = allEntries.map(entry => {
        return <li key={entry.blockId}>{entry.text}:{entry.blockId}</li>
    })

    return (
        <div>
            <h2 className='text-center'>
                Main page
            </h2>
            <ul>
                {list}
            </ul>
        </div>
    );
}
