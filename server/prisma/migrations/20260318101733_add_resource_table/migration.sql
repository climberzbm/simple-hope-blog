-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "path" TEXT,
    "content" TEXT,
    "category" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Resource_createdAt_idx" ON "Resource"("createdAt");
