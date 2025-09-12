import { mockPortfolioData, mockUserSession } from '@/lib/mockData';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard, FiActivity, FiPieChart } from 'react-icons/fi';

export default async function DashboardPage() {
    // Using mock data for development - replace with actual auth when Prisma is available
    const session = mockUserSession;
    const portfolio = mockPortfolioData;

    const totalDeposits = portfolio.deposits.reduce((acc, d) => acc + Number(d.amount), 0);
    const totalWithdrawals = portfolio.withdrawals.reduce((acc, w) => acc + Number(w.amount), 0);
    const profitLoss = portfolio.balance - totalDeposits + totalWithdrawals;
    const profitLossPercent = ((profitLoss / totalDeposits) * 100).toFixed(2);

    return (
        <div className="text-white animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user.name}!</h1>
                    <p className="text-gray-400">Here's your trading overview for today</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                        <FiCreditCard className="inline mr-2" />
                        Deposit
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                        Withdraw
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <FiDollarSign className="w-8 h-8 text-green-400" />
                        <span className={`text-sm px-2 py-1 rounded-full ${profitLoss >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {profitLoss >= 0 ? '+' : ''}{profitLossPercent}%
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Total Balance</h3>
                    <p className="text-3xl font-bold text-white">${portfolio.balance.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <FiTrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Total Deposits</h3>
                    <p className="text-3xl font-bold text-white">${totalDeposits.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <FiTrendingDown className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Total Withdrawals</h3>
                    <p className="text-3xl font-bold text-white">${totalWithdrawals.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <FiActivity className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">P&L</h3>
                    <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Portfolio Overview */}
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center">
                            <FiPieChart className="mr-3 text-indigo-400" />
                            Currency Positions
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        {portfolio.assets.map((asset, index) => {
                            const isPositive = asset.change.startsWith('+');
                            return (
                                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-400 font-bold text-sm">
                                                {asset.symbol.split('/')[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{asset.symbol}</p>
                                            <p className="text-sm text-gray-400">Foreign Exchange</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">${asset.amount.toLocaleString()}</p>
                                        <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                            {asset.change}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                    
                    {/* Admin Controls */}
                    {session.user.role === 'ADMIN' && (
                        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-yellow-400 font-semibold mb-3">Admin Controls</p>
                            <div className="space-y-2">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                    Update Balances
                                </button>
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                    Manage Users
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-3 text-green-400">Recent Deposits</h3>
                            <div className="space-y-2">
                                {portfolio.deposits.slice(0, 3).map(d => (
                                    <div key={d.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-white font-medium">${Number(d.amount).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{d.createdAt.toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {d.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-red-400">Recent Withdrawals</h3>
                            <div className="space-y-2">
                                {portfolio.withdrawals.map(w => (
                                    <div key={w.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                        <div>
                                            <p className="text-white font-medium">${Number(w.amount).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{w.createdAt.toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${w.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {w.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 rounded-xl border border-indigo-500/30">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center">
                        <FiCreditCard className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                        <span className="text-sm">Deposit Funds</span>
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center">
                        <FiTrendingDown className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <span className="text-sm">Withdraw</span>
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center">
                        <FiActivity className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <span className="text-sm">Trade Now</span>
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center">
                        <FiPieChart className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                        <span className="text-sm">Analytics</span>
                    </button>
                </div>
            </div>
        </div>
    );
}