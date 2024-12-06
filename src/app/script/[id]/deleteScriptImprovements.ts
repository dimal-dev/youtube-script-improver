'use server'
import prisma from "@/lib/db";

export default async function deleteScriptImprovements(scriptLineId: number) {
    try {
        await prisma.scriptLineImprovement.deleteMany({
            where: {
                scriptLineId
            }
        })

        await prisma.scriptLine.update({
            data: {
                hasImprovements: false,
            },
            where: {
                id: scriptLineId
            }
        })
    } catch (e) {
        console.error(e)
    }
}