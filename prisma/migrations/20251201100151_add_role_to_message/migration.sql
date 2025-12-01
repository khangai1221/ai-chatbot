-- DropIndex
DROP INDEX "Character_name_key";

-- AlterTable
ALTER TABLE "Character" ALTER COLUMN "basePrompt" DROP DEFAULT,
ALTER COLUMN "greetingText" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
