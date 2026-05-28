import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

type DataRecord = { id: string; [key: string]: unknown };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dataFilePath(resource: string): string {
  return path.join(__dirname, "../../data", `${resource}.json`);
}

function readData(resource: string): DataRecord[] {
  const filePath = dataFilePath(resource);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as DataRecord[];
}

function writeData(resource: string, data: DataRecord[]): void {
  fs.writeFileSync(dataFilePath(resource), JSON.stringify(data, null, 2), "utf-8");
}

function nextId(data: DataRecord[]): string {
  if (data.length === 0) return "1";
  const maxId = Math.max(...data.map((r) => parseInt(r.id, 10) || 0));
  return String(maxId + 1);
}

// ─── Router factory ───────────────────────────────────────────────────────────

export function createResourceRouter(resource: string): Router {
  const router = Router();

  // GET /:resource — list all (with optional filtering & pagination)
  router.get("/", (req: Request, res: Response) => {
    let data = readData(resource);

    // Filtering: any query param that matches a field (except page/limit/sortBy/order)
    const reserved = new Set(["page", "limit", "sortBy", "order"]);
    for (const [key, value] of Object.entries(req.query)) {
      if (reserved.has(key) || value === undefined) continue;
      data = data.filter((item) =>
        String(item[key] ?? "")
          .toLowerCase()
          .includes(String(value).toLowerCase())
      );
    }

    // Sorting
    const sortBy = req.query.sortBy as string | undefined;
    const orderRaw = req.query.order;
    const order = (Array.isArray(orderRaw) ? orderRaw[0] : orderRaw) ?? "asc";
    if (sortBy) {
      data = [...data].sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (typeof av === "number" && typeof bv === "number") {
          return order === "desc" ? bv - av : av - bv;
        }
        return order === "desc"
          ? String(bv).localeCompare(String(av))
          : String(av).localeCompare(String(bv));
      });
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    if (!isNaN(page) && !isNaN(limit)) {
      const start = (page - 1) * limit;
      data = data.slice(start, start + limit);
    }

    res.json(data);
  });

  // GET /:resource/:id — get one by id
  router.get("/:id", (req: Request, res: Response) => {
    const data = readData(resource);
    const item = data.find((r) => r.id === req.params.id);
    if (!item) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(item);
  });

  // POST /:resource — create a new record
  router.post("/", (req: Request, res: Response) => {
    const data = readData(resource);
    const body = {
      ...(req.body as Omit<DataRecord, "id">),
      ...(resource === "cupom" ? { ativo: true } : {}),
    };
    const newItem: DataRecord = {
      ...body,
      id: nextId(data),
    };
    data.push(newItem);
    writeData(resource, data);
    res.status(201).json(newItem);
  });

  // PUT /:resource/:id — replace/update a record
  router.put("/:id", (req: Request, res: Response) => {
    const data = readData(resource);
    const index = data.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated: DataRecord = { ...(req.body as DataRecord), id };
    data[index] = updated;
    writeData(resource, data);
    res.json(updated);
  });

  // DELETE /:resource/:id — delete a record
  router.delete("/:id", (req: Request, res: Response) => {
    const data = readData(resource);
    const index = data.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const [deleted] = data.splice(index, 1);
    writeData(resource, data);
    res.json(deleted);
  });

  return router;
}
