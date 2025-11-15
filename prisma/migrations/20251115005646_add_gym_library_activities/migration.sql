-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "emoji" TEXT,
    "householdId" TEXT NOT NULL,
    "currentMood" TEXT,
    "tonightActivity" TEXT,
    "isAtGym" BOOLEAN NOT NULL DEFAULT false,
    "isAtLibrary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Member_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("colorHex", "createdAt", "currentMood", "emoji", "householdId", "id", "name", "tonightActivity") SELECT "colorHex", "createdAt", "currentMood", "emoji", "householdId", "id", "name", "tonightActivity" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
