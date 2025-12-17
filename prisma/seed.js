/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordPlain = "password";
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@udaan.local" },
    update: { name: "Admin", role: "ADMIN", passwordHash, isFree: true },
    create: { name: "Admin", email: "admin@udaan.local", role: "ADMIN", passwordHash, isFree: true },
  });

  const cam = await prisma.user.upsert({
    where: { email: "cameraman@udaan.local" },
    update: { name: "Cameraman One", role: "CAMERAMAN", passwordHash, isFree: true },
    create: { name: "Cameraman One", email: "cameraman@udaan.local", role: "CAMERAMAN", passwordHash, isFree: true },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@udaan.local" },
    update: { name: "Editor One", role: "EDITOR", passwordHash, isFree: true },
    create: { name: "Editor One", email: "editor@udaan.local", role: "EDITOR", passwordHash, isFree: true },
  });

  // Seed a couple events if not present (by name + date heuristic)
  const now = new Date();
  const ev1Date = new Date(now);
  ev1Date.setDate(ev1Date.getDate() - 1);

  const ev2Date = new Date(now);
  ev2Date.setDate(ev2Date.getDate() + 3);

  const existing = await prisma.event.findMany({
    where: { name: { in: ["Udaan Launch Day", "Corporate Meetup"] } },
    select: { id: true, name: true },
  });
  const has1 = existing.some((e) => e.name === "Udaan Launch Day");
  const has2 = existing.some((e) => e.name === "Corporate Meetup");

  if (!has1) {
    const ev1 = await prisma.event.create({
      data: {
        name: "Udaan Launch Day",
        date: ev1Date,
        cameramanId: cam.id,
        editorId: editor.id,
        status: "ASSIGNED",
      },
    });

    await prisma.file.create({
      data: {
        eventId: ev1.id,
        fileType: "RAW",
        name: "DSC_0001.MP4",
        driveFileId: null,
        uploaderId: cam.id,
        size: 12_400_000,
      },
    });

    // editor is now busy
    await prisma.user.update({ where: { id: editor.id }, data: { isFree: false } });
  }

  if (!has2) {
    await prisma.event.create({
      data: {
        name: "Corporate Meetup",
        date: ev2Date,
        cameramanId: cam.id,
        editorId: null,
        status: "CREATED",
      },
    });
  }

  console.log("Seed complete:", { admin: admin.email, cam: cam.email, editor: editor.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


