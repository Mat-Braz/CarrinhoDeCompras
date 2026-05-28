import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

type PushToken = {
  id: string;
  plataforma: string;
  token: string;
};

function dataFilePath(): string {
  return path.join(__dirname, "../../data/push-token.json");
}

function readData(): PushToken[] {
  const filePath = dataFilePath();
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PushToken[];
}

function writeData(data: PushToken[]): void {
  fs.writeFileSync(dataFilePath(), JSON.stringify(data, null, 2), "utf-8");
}

function nextId(data: PushToken[]): string {
  if (data.length === 0) return "1";
  const maxId = Math.max(...data.map((record) => parseInt(record.id, 10) || 0));
  return String(maxId + 1);
}

export function createPushTokenRouter(): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.json(readData());
  });

  router.post("/", (req: Request, res: Response) => {
    const token = String(req.body.token ?? "").trim();
    const plataforma = String(req.body.plataforma ?? "").trim();

    if (!token) {
      res.status(400).json({ message: "Token obrigatorio" });
      return;
    }

    const data = readData();
    const existingToken = data.find((item) => item.token === token);

    if (existingToken) {
      existingToken.plataforma = plataforma;
      writeData(data);
      res.json(existingToken);
      return;
    }

    const created: PushToken = {
      id: nextId(data),
      plataforma,
      token,
    };

    writeData([created, ...data]);
    res.status(201).json(created);
  });

  return router;
}
