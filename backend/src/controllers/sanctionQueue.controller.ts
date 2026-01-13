import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getSanctionQueue = async (_req: Request, res: Response) => {
  const documents = await prisma.document.findMany({
    include: {
      riskSnapshot: true,
      owner: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.json(documents);
};
