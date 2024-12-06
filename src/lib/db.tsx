import {PrismaClient} from '@prisma/client'

export enum ScriptLineState {
    IN_SYNC_WITH_NOTION = 1,
    MODIFIED = 2,
}

// const prismaClientSingleton = () => new PrismaClient();
//
// declare const globalThis: {
//     prismaGlobal: ReturnType<typeof prismaClientSingleton>;
// } & typeof global;
//
// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
//
// export default prisma;
//
// if (process.env.NODE_ENV !== 'production') {
//     globalThis.prismaGlobal = prisma;
// }

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

export default prisma();