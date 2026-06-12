-- CreateTable
CREATE TABLE "lot_logos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_logos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lot_logos_user_id_key" ON "lot_logos"("user_id");

-- AddForeignKey
ALTER TABLE "lot_logos" ADD CONSTRAINT "lot_logos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
