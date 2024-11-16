const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ДБМ Таймер API",
      version: "1.0.0",
      description: "API Документация",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
	},
	//# Paths to my route files
  apis: [
    "./src/routes/userRouter/userRouter.ts",
    "./src/routes/authRouter/authRouter.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

//# Save the generated Swagger JSON to a file
fs.writeFileSync(
  "./swagger.json",
  JSON.stringify(swaggerSpec, null, 2),
  "utf-8"
);
