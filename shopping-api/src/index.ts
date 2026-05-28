import express from "express";
import cors from "cors";
import { createResourceRouter } from "./routes/resourceRouter";
import { createCartRouter } from "./routes/cartRouter";
import { createPushTokenRouter } from "./routes/pushTokenRouter";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use("/carrinho", createCartRouter());
app.use("/push-token", createPushTokenRouter());

const resources = ["produto", "cupom", "pedido", "notificacao"];

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
          "POST   /carrinho/finalizar",
          "POST   /carrinho",
          "PUT    /carrinho/:id",
          "DELETE /carrinho/:id",
          "DELETE /carrinho",
        ],
      },
      {
        name: "push-token",
        endpoints: ["GET    /push-token", "POST   /push-token"],
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
