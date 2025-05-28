-- CreateTable
CREATE TABLE "BalanceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "BalanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BalanceItem_categoryId_idx" ON "BalanceItem"("categoryId");

-- AddForeignKey
ALTER TABLE "BalanceItem" ADD CONSTRAINT "BalanceItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BalanceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
