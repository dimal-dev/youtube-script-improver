-- CreateTable
CREATE TABLE "Script" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "notionBlockId" VARCHAR(50),
    "title" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptLine" (
    "id" SERIAL NOT NULL,
    "scriptId" INTEGER NOT NULL,
    "notionBlockId" VARCHAR(50),
    "content" TEXT,
    "state" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "ScriptLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptLineImprovement" (
    "id" SERIAL NOT NULL,
    "scriptLineId" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScriptLineImprovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Script_notionBlockId_key" ON "Script"("notionBlockId");

-- AddForeignKey
ALTER TABLE "ScriptLine" ADD CONSTRAINT "ScriptLine_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptLineImprovement" ADD CONSTRAINT "ScriptLineImprovement_scriptLineId_fkey" FOREIGN KEY ("scriptLineId") REFERENCES "ScriptLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
