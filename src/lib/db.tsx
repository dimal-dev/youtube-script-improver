import {PrismaClient} from '@prisma/client'

export enum ScriptLineState {
    IN_SYNC_WITH_NOTION = 1,
    MODIFIED = 2,
}

const prisma = (() => {
    let prismaClient: PrismaClient | undefined;

    return () => {
        if (!prismaClient) {
            prismaClient = new PrismaClient({
                log: ['query', 'info', 'warn', 'error'],
            });
        }

        return prismaClient;
    }
})();

export async function getScriptLinesOutOfSyncCount() {
    return prisma().scriptLine.count({
        where: {
            state: ScriptLineState.MODIFIED
        }
    });
}

export default prisma();