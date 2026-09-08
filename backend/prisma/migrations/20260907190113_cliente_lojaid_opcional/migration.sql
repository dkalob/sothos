/*
  Warnings:

  - Made the column `email` on table `cliente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefone` on table `cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cliente" ALTER COLUMN "id_loja" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "telefone" SET NOT NULL;
