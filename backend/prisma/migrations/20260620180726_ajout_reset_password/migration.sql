-- AlterTable
ALTER TABLE "membre" ADD COLUMN     "code_reset" VARCHAR(6),
ADD COLUMN     "code_reset_expire" TIMESTAMP(3);
