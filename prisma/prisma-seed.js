import { PrismaClient, ChatType } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  const globalChat = await prisma.chat.findFirst({
    where: {
      chatType: ChatType.GLOBAL,
    },
  });

  if (!globalChat) {
    await prisma.chat.create({
      data: {
        name: "Общий чат",
        creationTime: Date.now(),
        lastUpdateTimeMillis: Date.now(),
        chatType: ChatType.GLOBAL,
      },
    });
    console.log("Global chat created");
  } else {
    console.log("Global chat already exists");
  }
};

try {
  await seed();
} catch (error) {
  console.error(`Error populating the database: ${error}`);
  process.exit(1);
}
