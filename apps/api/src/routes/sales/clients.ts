import type { Request, Response } from "express";
import * as sales from "../../lib/sales/repository.js";

export async function getSalesClients(_req: Request, res: Response): Promise<void> {
  const clients = await sales.listSalesClients();
  res.json({ clients });
}

export async function getSalesClient(req: Request, res: Response): Promise<void> {
  const client = await sales.getSalesClientById(req.params.id);
  if (!client) {
    res.status(404).json({ error: "Sales client not found" });
    return;
  }
  res.json({ client });
}
