'use server'
import prisma, {getScriptLinesOutOfSyncCount, ScriptLineState} from "@/lib/db";

export default async function saveScriptLineHandler(
    scriptLineId: number, newContent: string
) {
    const scriptLine = await prisma.scriptLine.findUnique({
        where: {
            id: scriptLineId,
        }
    });
    if (!scriptLine) {
        throw 'Not found';
    }

    if (scriptLine.content?.trim() === newContent.trim()) {
        return getScriptLinesOutOfSyncCount();
    }

    const updateResult = await prisma.scriptLine.update({
        where: {
            id: scriptLineId,
        },
        data: {
            content: newContent,
            state: ScriptLineState.MODIFIED,
            updatedAt: new Date()
        }
    });

    return getScriptLinesOutOfSyncCount();
}