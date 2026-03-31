-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_lastEditedById_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE_TO_TEAM',
ALTER COLUMN "lastEditedById" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Item_deletedAt_idx" ON "Item"("deletedAt");

-- CreateIndex
CREATE INDEX "Item_visibility_idx" ON "Item"("visibility");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
