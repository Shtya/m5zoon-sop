import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.trainingStepProgress.deleteMany();
  await prisma.trainingEnrollment.deleteMany();
  await prisma.trainingPathStep.deleteMany();
  await prisma.trainingPath.deleteMany();
  await prisma.sopView.deleteMany();
  await prisma.sopFeedback.deleteMany();
  await prisma.sopAcknowledgment.deleteMany();
  await prisma.sopComment.deleteMany();
  await prisma.sopHistory.deleteMany();
  await prisma.sopCountry.deleteMany();
  await prisma.issueComment.deleteMany();
  await prisma.issueAffectedUser.deleteMany();
  await prisma.issueCountry.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.sop.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.user.deleteMany();
  await prisma.country.deleteMany();

  await prisma.country.createMany({
    data: [
      { id: "ae", name: "الإمارات", flag: "AE", color: "#10B981" },
      { id: "sa", name: "السعودية", flag: "SA", color: "#22c55e" },
      { id: "jo", name: "الأردن", flag: "JO", color: "#ef4444" },
      { id: "om", name: "عُمان", flag: "OM", color: "#f59e0b" },
    ],
  });

  await prisma.user.create({
    data: {
      name: "Noor Salah",
      email: "noor@gmail.com",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: Role.super_admin,
      department: "operations",
      active: true,
      avatar: "NS",
      position: "Operations Director",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
