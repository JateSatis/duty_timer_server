import * as dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

const main = async () => {

	const serverPort = process.env.SERVER_PORT

  app.listen(serverPort, () => {
    console.log(`Server up and running on port ${serverPort}`);
  });
};

main();
