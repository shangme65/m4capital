// Mock data for development when Prisma is not available
export const mockPortfolioData = {
  id: "mock-portfolio-1",
  userId: "mock-user-1",
  balance: 15750.50,
  assets: [
    { symbol: "EUR/USD", amount: 2500.00, change: "+2.5%" },
    { symbol: "GBP/USD", amount: 3200.00, change: "-1.2%" },
    { symbol: "USD/JPY", amount: 1800.00, change: "+0.8%" },
    { symbol: "AUD/USD", amount: 2100.00, change: "+1.5%" },
    { symbol: "USD/CAD", amount: 1650.00, change: "-0.3%" },
  ],
  deposits: [
    { id: "1", amount: 5000.00, status: "COMPLETED", createdAt: new Date("2024-01-15") },
    { id: "2", amount: 2500.00, status: "COMPLETED", createdAt: new Date("2024-01-10") },
    { id: "3", amount: 1000.00, status: "PENDING", createdAt: new Date("2024-01-20") },
  ],
  withdrawals: [
    { id: "1", amount: 1500.00, status: "COMPLETED", createdAt: new Date("2024-01-18") },
    { id: "2", amount: 800.00, status: "PENDING", createdAt: new Date("2024-01-22") },
  ]
};

export const mockUserSession = {
  user: {
    id: "mock-user-1",
    name: "John Trader",
    email: "john@example.com",
    role: "USER"
  }
};