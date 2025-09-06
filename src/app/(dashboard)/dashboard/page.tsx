import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// This is a server component to fetch data
async function getPortfolioData(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: {
            deposits: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            withdrawals: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
        },
    });
    return portfolio;
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login');
    }

    const portfolio = await getPortfolioData(session.user.id);

    if (!portfolio) {
        return <div>No portfolio found for this user.</div>;
    }
    
    // Type assertion for assets
    const assets: { symbol: string; amount: number }[] = portfolio.assets as any;

    return (
        <div className="text-white animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">Welcome, {session.user.name || 'User'}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-400">Total Balance</h3>
                    <p className="text-4xl font-bold text-green-400">${Number(portfolio.balance).toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-400">Total Deposits</h3>
                    <p className="text-4xl font-bold">${portfolio.deposits.reduce((acc, d) => acc + Number(d.amount), 0).toLocaleString()}</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-400">Total Withdrawals</h3>
                    <p className="text-4xl font-bold">${portfolio.withdrawals.reduce((acc, w) => acc + Number(w.amount), 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Crypto Assets</h2>
                    <ul className="space-y-4">
                        {assets.map((asset) => (
                            <li key={asset.symbol} className="flex justify-between items-center">
                                <span className="font-semibold">{asset.symbol}</span>
                                <span>{asset.amount}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Recent History</h2>
                    {/* Placeholder for manual update buttons for ADMIN */}
                    {session.user.role === 'ADMIN' && (
                         <div className="mb-4">
                             <p className="text-yellow-400">Admin Controls:</p>
                             <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2">Update Balances</button>
                             <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Manage Users</button>
                         </div>
                    )}
                    <h3 className="font-semibold mb-2">Deposits</h3>
                    <ul className="text-sm text-gray-400 mb-4">
                        {portfolio.deposits.map(d => <li key={d.id}>${Number(d.amount)} - {d.status}</li>)}
                    </ul>
                    <h3 className="font-semibold mb-2">Withdrawals</h3>
                    <ul className="text-sm text-gray-400">
                        {portfolio.withdrawals.map(w => <li key={w.id}>${Number(w.amount)} - {w.status}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
}