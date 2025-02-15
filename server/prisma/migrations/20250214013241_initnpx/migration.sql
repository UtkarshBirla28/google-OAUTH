-- CreateTable
CREATE TABLE "GoogleUser" (
    "id" SERIAL NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_googleId_key" ON "GoogleUser"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_email_key" ON "GoogleUser"("email");
