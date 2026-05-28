import { Router, Request, Response } from "express";
import admin from "firebase-admin";
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

type DeliveryMethod = "regular" | "expressa" | "retirada";

type CarrinhoItem = DataRecord & {
  produtoId: string;
  quantidade: number;
};

type PushToken = DataRecord & {
  token: string;
};

const FRETE_POR_ENTREGA: Record<DeliveryMethod, number> = {
  regular: 15,
  expressa: 29.9,
  retirada: 0,
};

function normalizeDeliveryMethod(value: unknown): DeliveryMethod {
  return value === "expressa" || value === "retirada" || value === "regular" ? value : "regular";
}

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

function getFirebaseMessaging() {
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    path.join(__dirname, "../../firebase-service-account.json");

  if (!fs.existsSync(serviceAccountPath)) {
    return null;
  }

  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.messaging();
}

async function sendPurchasePushNotification(orderId: string) {
  const messaging = getFirebaseMessaging();
  const tokens = readData<PushToken>("push-token").map((item) => item.token).filter(Boolean);

  if (!messaging || tokens.length === 0) {
    return;
  }

  await messaging.sendEachForMulticast({
    notification: {
      body: `Sua compra #${orderId} foi finalizada com sucesso.`,
      title: "Compra finalizada",
    },
    tokens,
  });
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

function buildCartSummary(couponCode?: string, deliveryMethod?: unknown) {
  const produtos = readData<Produto>("produto");
  const cupons = readData<Cupom>("cupom");
  const carrinho = readData<CarrinhoItem>("carrinho");
  const entrega = normalizeDeliveryMethod(deliveryMethod);

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
  const frete = itens.length > 0 ? FRETE_POR_ENTREGA[entrega] : 0;
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
    res.json(buildCartSummary(req.query.cupom as string | undefined, req.query.entrega));
  });

  router.get("/", (_req: Request, res: Response) => {
    res.json(readData<CarrinhoItem>("carrinho"));
  });

  router.post("/finalizar", async (req: Request, res: Response) => {
    const couponCode = String(req.body.cupom ?? "").trim();
    const summary = buildCartSummary(couponCode, req.body.entrega);
    const pedidos = readData<DataRecord>("pedido");
    const notificacoes = readData<DataRecord>("notificacao");

    if (summary.itens.length === 0) {
      res.status(400).json({ message: "Carrinho vazio" });
      return;
    }

    const pedido = {
      id: nextId(pedidos),
      criadoEm: new Date().toISOString(),
      endereco: req.body.endereco,
      entrega: normalizeDeliveryMethod(req.body.entrega),
      formaPagamento: req.body.formaPagamento,
      itens: summary.itens,
      subtotal: summary.subtotal,
      frete: summary.frete,
      desconto: summary.desconto,
      total: summary.total,
      cupomAplicado: summary.cupomAplicado,
      status: "Compra realizada",
    };

    writeData("pedido", [pedido, ...pedidos]);
    writeData("notificacao", [
      {
        id: nextId(notificacoes),
        criadaEm: new Date().toISOString(),
        lida: false,
        mensagem: `Sua compra #${pedido.id} foi finalizada com sucesso.`,
        pedidoId: pedido.id,
        titulo: "Compra finalizada",
      },
      ...notificacoes,
    ]);

    if (summary.cupomAplicado) {
      const cupons = readData<Cupom>("cupom");
      const coupon = cupons.find((currentCoupon) => currentCoupon.id === summary.cupomAplicado?.id);

      if (coupon) {
        coupon.ativo = false;
        writeData("cupom", cupons);
      }
    }

    writeData("carrinho", []);
    try {
      await sendPurchasePushNotification(pedido.id);
    } catch {
      // The in-app notification remains available even if FCM delivery fails locally.
    }
    res.json({ message: "Compra finalizada", pedido });
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
