import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (session?.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "POST") {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Missing userId or amount" });
    }

    try {
      const updatedPortfolio = await prisma.portfolio.update({
        where: { userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await prisma.deposit.create({
        data: {
          amount,
          status: "COMPLETED",
          currency: "USD", // Or get from request if available
          portfolio: {
            connect: {
              id: updatedPortfolio.id,
            },
          },
        },
      });

      return res.status(200).json(updatedPortfolio);
    } catch (error) {
      return res.status(500).json({ error: "Failed to top up balance" });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
