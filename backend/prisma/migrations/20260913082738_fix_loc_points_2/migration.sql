/*
  Warnings:

  - A unique constraint covering the columns `[longitude,latitude]` on the table `facilities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "facilities_longitude_latitude_key" ON "facilities"("longitude", "latitude");
