import express from "express";
import cors from "cors";
import { createResourceRouter } from "./routes/resourceRouter";
import { createCartRouter } from "./routes/cartRouter";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use("/carrinho", createCartRouter());

const resources = ["produto", "cupom"];

for (const resource of resources) {
  app.use(`/${resource}`, createResourceRouter(resource));
  console.log(`Registered resource: /${resource}`);
}

app.get("/", (_req, res) => {
  res.json({
    message: "Shopping API running",
    resources: [
      ...resources.map((resource) => ({
        name: resource,
        endpoints: [
          `GET    /${resource}`,
          `GET    /${resource}/:id`,
          `POST   /${resource}`,
          `PUT    /${resource}/:id`,
          `DELETE /${resource}/:id`,
        ],
      })),
      {
        name: "carrinho",
        endpoints: [
          "GET    /carrinho",
          "GET    /carrinho/resumo?cupom=CODIGO",
          "POST   /carrinho",
          "PUT    /carrinho/:id",
          "DELETE /carrinho/:id",
          "DELETE /carrinho",
        ],
      },
    ],
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Shopping API running at http://localhost:${PORT}`);
});

export default app;
