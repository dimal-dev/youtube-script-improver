'use server'
import {redirect} from "next/navigation";
import prisma from "@/lib/db";
import notion from "@/lib/notion";

export default async function addScriptHandler(state, formData: FormData) {

// export default async function addScriptHandler(state: void, formData: FormData) {
    'use server'

    const url = formData.get('url') as string;
    const blockId = formData.get('blockId') as string;
    const pageId = extractPageIdFromUrl(url)
    const title = await getPageTitle(pageId)

    const script = await prisma.script.create({
        data: {
            url,
            notionBlockId: blockId,
            title
        }
    })

    redirect(`/script/${script.id}`);
}

function extractPageIdFromUrl(url: string): string {
    const regex = /(\-|\/){1}(?<id>[a-zA-Z0-9]{32})$/
    const match = url.match(regex)
    if (match && match.groups) {
        return match.groups.id
    }

    throw new Error('Invalid URL')
}

async function getPageTitle(pageId: string): Promise<string> {
    const params = {page_id: pageId}
    const response = await notion.pages.retrieve(params);
    const pageTitle = response?.properties?.title?.title[0]?.plain_text;

    return pageTitle ?? '';
}
