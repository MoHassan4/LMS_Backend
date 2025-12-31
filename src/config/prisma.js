import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Prisma 7 ياخد DATABASE_URL من env تلقائي

export default prisma;
