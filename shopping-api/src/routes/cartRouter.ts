import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

type DataRecord = { id: string; [key: string]: unknown };

type Produto = DataRecord & {
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;
  imagem: string;
};

type Cupom = DataRecord & {
  codigo: string;
  descricao: string;
  tipo: "percentual" | "valor";
  valor: number;
  ativo: boolean;
};

type CarrinhoItem = DataRecord & {
  produtoId: string;
  quantidade: number;
};

const FRETE_FIXO = 15;

function dataFilePath(resource: string): string {
  return path.join(__dirname, "../../data", `${resource}.json`);
}

function readData<T extends DataRecord>(resource: string): T[] {
  const filePath = dataFilePath(resource);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
}

function writeData<T extends DataRecord>(resource: string, data: T[]): void {
  fs.writeFileSync(dataFilePath(resource), JSON.stringify(data, null, 2), "utf-8");
}

function nextId(data: DataRecord[]): string {
  if (data.length === 0) return "1";
  const maxId = Math.max(...data.map((record) => parseInt(record.id, 10) || 0));
  return String(maxId + 1);
}

function normalizeQuantity(value: unknown): number {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
}

function buildCartSummary(couponCode?: string) {
  const produtos = readData<Produto>("produto");
  const cupons = readData<Cupom>("cupom");
  const carrinho = readData<CarrinhoItem>("carrinho");

  const itens = carrinho
    .map((item) => {
      const produto = produtos.find((currentProduct) => currentProduct.id === item.produtoId);
      if (!produto) return null;

      return {
        ...item,
        produto,
        quantidade: normalizeQuantity(item.quantidade),
        total: produto.preco * normalizeQuantity(item.quantidade),
      };
    })
    .filter((item): item is CarrinhoItem & { produto: Produto; total: number } => Boolean(item));

  const subtotal = itens.reduce((total, item) => total + item.total, 0);
  const cupomAplicado = couponCode
    ? cupons.find(
        (cupom) => cupom.ativo && cupom.codigo.toLowerCase() === couponCode.toLowerCase()
      ) ?? null
    : null;
  const desconto = cupomAplicado
    ? cupomAplicado.tipo === "percentual"
      ? subtotal * (cupomAplicado.valor / 100)
      : cupomAplicado.valor
    : 0;
  const frete = itens.length > 0 ? FRETE_FIXO : 0;
  const total = Math.max(0, subtotal + frete - desconto);

  return {
    itens,
    subtotal: Number(subtotal.toFixed(2)),
    frete: Number(frete.toFixed(2)),
    desconto: Number(Math.min(desconto, subtotal + frete).toFixed(2)),
    total: Number(total.toFixed(2)),
    cupomAplicado,
  };
}

export function createCartRouter(): Router {
  const router = Router();

  router.get("/resumo", (req: Request, res: Response) => {
    res.json(buildCartSummary(req.query.cupom as string | undefined));
  });

  router.get("/", (_req: Request, res: Response) => {
    res.json(readData<CarrinhoItem>("carrinho"));
  });

  router.post("/", (req: Request, res: Response) => {
    const produtos = readData<Produto>("produto");
    const carrinho = readData<CarrinhoItem>("carrinho");
    const produtoId = String(req.body.produtoId ?? "");
    const produto = produtos.find((currentProduct) => currentProduct.id === produtoId);

    if (!produto) {
      res.status(404).json({ message: "Produto nao encontrado" });
      return;
    }

    const quantidade = normalizeQuantity(req.body.quantidade);
    const existingItem = carrinho.find((item) => item.produtoId === produtoId);

    if (existingItem) {
      existingItem.quantidade = normalizeQuantity(existingItem.quantidade) + quantidade;
      writeData("carrinho", carrinho);
      res.json(existingItem);
      return;
    }

    const newItem: CarrinhoItem = {
      id: nextId(carrinho),
      produtoId,
      quantidade,
    };

    carrinho.push(newItem);
    writeData("carrinho", carrinho);
    res.status(201).json(newItem);
  });

  router.put("/:id", (req: Request, res: Response) => {
    const carrinho = readData<CarrinhoItem>("carrinho");
    const index = carrinho.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ message: "Item nao encontrado" });
      return;
    }

    carrinho[index] = {
      ...carrinho[index],
      quantidade: normalizeQuantity(req.body.quantidade),
    };
    writeData("carrinho", carrinho);
    res.json(carrinho[index]);
  });

  router.delete("/:id", (req: Request, res: Response) => {
    const carrinho = readData<CarrinhoItem>("carrinho");
    const index = carrinho.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ message: "Item nao encontrado" });
      return;
    }

    const [deleted] = carrinho.splice(index, 1);
    writeData("carrinho", carrinho);
    res.json(deleted);
  });

  router.delete("/", (_req: Request, res: Response) => {
    writeData("carrinho", []);
    res.json({ message: "Carrinho limpo" });
  });

  return router;
}
