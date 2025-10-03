"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Activity, BarChart3, DollarSign } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  getVaultInfo,
  getTraderStats,
  getPositionCount,
  addCollateral,
  withdrawCollateral,
  toggleVaultStatus,
  octasToAPT,
  formatWinRate,
  type VaultInfo,
  type TraderStats,
} from "@/utils/contractService"

interface OrderBookLevel {
  price: string
  size: string
  total: number
}

export default function VaultDashboard() {
  const { account, connected, disconnect, signAndSubmitTransaction } = useWallet()

  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null)
  const [traderStats, setTraderStats] = useState<TraderStats | null>(null)
  const [positionCount, setPositionCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] }>({
    bids: [],
    asks: [],
  })

  // Form states
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  // Performance data for chart
  const performanceData = [
    { date: "Sep 1", value: 10000 },
    { date: "Sep 8", value: 10420 },
    { date: "Sep 15", value: 10890 },
    { date: "Sep 22", value: 11230 },
    { date: "Sep 29", value: 11650 },
    { date: "Oct 1", value: 12150 },
  ]

  // Helper to get address as string
  const getAddressString = (): string | null => {
    if (!account?.address) return null

    // If address is already a string, return it
    if (typeof account.address === "string") {
      return account.address
    }

    // If address is an object with toString method
    if (account.address.toString && typeof account.address.toString === "function") {
      return account.address.toString()
    }

    return null
  }

  // Load vault data when wallet connects
  useEffect(() => {
    if (connected && account?.address) {
      loadVaultData()
    }
  }, [connected, account])

  // Mouse tracking for spotlight effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Mock order book data
  useEffect(() => {
    const mockBids: OrderBookLevel[] = [
      { price: "10.50", size: "100", total: 100 },
      { price: "10.45", size: "250", total: 350 },
      { price: "10.40", size: "500", total: 850 },
      { price: "10.35", size: "1000", total: 1850 },
      { price: "10.30", size: "750", total: 2600 },
    ]

    const mockAsks: OrderBookLevel[] = [
      { price: "10.55", size: "150", total: 150 },
      { price: "10.60", size: "300", total: 450 },
      { price: "10.65", size: "450", total: 900 },
      { price: "10.70", size: "800", total: 1700 },
      { price: "10.75", size: "600", total: 2300 },
    ]

    setOrderBook({ bids: mockBids, asks: mockAsks })
  }, [])

  const loadVaultData = async () => {
    const addressString = getAddressString()
    if (!addressString) {
      console.error("No valid address found")
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Loading vault data for address:", addressString)

      // Get vault info
      const vault = await getVaultInfo(addressString)
      setVaultInfo(vault)

      if (vault) {
        // Get trader stats
        const stats = await getTraderStats(vault.trader_following)
        setTraderStats(stats)

        // Get position count
        const count = await getPositionCount(addressString)
        setPositionCount(count)
      }
    } catch (error) {
      console.error("Error loading vault data:", error)
      setError("Failed to load vault data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || !signAndSubmitTransaction) return

    try {
      setLoading(true)
      setError(null)
      await addCollateral(signAndSubmitTransaction, Number.parseFloat(depositAmount))
      alert("Deposit successful!")
      setDepositAmount("")
      await loadVaultData()
    } catch (error) {
      console.error("Deposit failed:", error)
      setError("Deposit failed. Please check the console for details.")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || !signAndSubmitTransaction) return

    try {
      setLoading(true)
      setError(null)
      await withdrawCollateral(signAndSubmitTransaction, Number.parseFloat(withdrawAmount))
      alert("Withdrawal successful!")
      setWithdrawAmount("")
      await loadVaultData()
    } catch (error) {
      console.error("Withdrawal failed:", error)
      setError("Withdrawal failed. Make sure you have no open positions.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVault = async () => {
    if (!signAndSubmitTransaction) return

    try {
      setLoading(true)
      setError(null)
      await toggleVaultStatus(signAndSubmitTransaction)
      alert("Vault status toggled!")
      await loadVaultData()
    } catch (error) {
      console.error("Toggle failed:", error)
      setError("Toggle failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const vaultBalance = vaultInfo ? octasToAPT(vaultInfo.collateral) : 0
  const winRate = traderStats ? formatWinRate(traderStats.win_rate) : "0%"
  const followerCount = traderStats ? traderStats.total_followers : "0"
  const totalTrades = traderStats ? traderStats.total_positions : "0"
  const traderName =
    traderStats?.trader_name ||
    (vaultInfo?.trader_following
      ? `${String(vaultInfo.trader_following).slice(0, 6)}...${String(vaultInfo.trader_following).slice(-4)}`
      : "Unknown Trader")

  const stats = [
    {
      label: "Vault Balance",
      value: `${vaultBalance.toFixed(2)} APT`,
      change: "+21.5%",
      icon: <Wallet className="w-5 h-5" />,
      positive: true,
    },
    {
      label: "30D Return",
      value: "+18.3%",
      change: "$1,830",
      icon: <TrendingUp className="w-5 h-5" />,
      positive: true,
    },
    {
      label: "Total Trades",
      value: totalTrades,
      change: `${positionCount} open`,
      icon: <Activity className="w-5 h-5" />,
      positive: true,
    },
    {
      label: "Win Rate",
      value: winRate,
      change: "+2.1%",
      icon: <BarChart3 className="w-5 h-5" />,
      positive: true,
    },
  ]

  const recentTrades = [
    { pair: "APT/USDC", side: "BUY", price: "10.52", amount: "100", time: "2 min ago", pnl: "+2.3%" },
    { pair: "APT/USDC", side: "SELL", price: "10.48", amount: "50", time: "15 min ago", pnl: "+1.1%" },
    { pair: "APT/USDC", side: "BUY", price: "10.45", amount: "200", time: "1 hour ago", pnl: "+3.2%" },
  ]

  const getMaxTotal = () => {
    const maxBid = orderBook.bids[orderBook.bids.length - 1]?.total || 0
    const maxAsk = orderBook.asks[orderBook.asks.length - 1]?.total || 0
    return Math.max(maxBid, maxAsk)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729] relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />
      <div className="pointer-events-none fixed top-20 right-20 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-20 left-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 right-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" />

      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CopyVault
              </span>
            </a>

            <div className="flex gap-4">
              <a href="/traders" className="text-slate-300 hover:text-cyan-400 transition px-4 py-2">
                Browse Traders
              </a>
              {connected && account ? (
                <div className="flex gap-2 items-center">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-lg text-white font-mono text-sm">
                    {(() => {
                      const addr = getAddressString()
                      return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Unknown"
                    })()}
                  </div>
                  <button
                    onClick={disconnect}
                    className="bg-red-600/80 hover:bg-red-700 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 px-4 py-2">Connect wallet via provider</div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {loading && (
          <div className="fixed top-20 right-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 backdrop-blur-sm">
            Loading...
          </div>
        )}

        {error && (
          <div className="fixed top-20 right-4 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}

        {!connected ? (
          <div className="text-center py-20">
            <h2 className="text-4xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-slate-300 mb-8 text-lg">Please connect your Aptos wallet to view your vault</p>
          </div>
        ) : !vaultInfo ? (
          <div className="text-center py-20">
            <h2 className="text-4xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              No Vault Found
            </h2>
            <p className="text-slate-300 mb-8 text-lg">Create a vault to start copy trading</p>
            <a
              href="/traders"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold inline-block shadow-lg shadow-blue-500/30 transition-all"
            >
              Browse Traders
            </a>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-5xl bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                My Vault
              </h1>
              <p className="text-slate-300 text-lg">
                Status:{" "}
                <span className={vaultInfo.is_active ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                  {vaultInfo.is_active ? "Active" : "Paused"}
                </span>
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-sm">{stat.label}</span>
                    <div className="text-cyan-400">{stat.icon}</div>
                  </div>
                  <div className="text-3xl text-white mb-1">{stat.value}</div>
                  <div className={`text-sm flex items-center ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                    {stat.positive ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-8">
                {/* Performance Chart */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-white">Portfolio Performance</h2>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm shadow-lg shadow-blue-500/30">
                        30D
                      </button>
                      <button className="px-3 py-1 bg-slate-800/50 border border-blue-500/20 text-slate-300 rounded-lg text-sm hover:bg-slate-700/50 transition">
                        90D
                      </button>
                      <button className="px-3 py-1 bg-slate-800/50 border border-blue-500/20 text-slate-300 rounded-lg text-sm hover:bg-slate-700/50 transition">
                        1Y
                      </button>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          borderRadius: "12px",
                          color: "#fff",
                          backdropFilter: "blur(12px)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="url(#colorGradient)"
                        strokeWidth={3}
                        dot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "#0891b2" }}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Trades */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/5">
                  <h2 className="text-2xl text-white mb-6">Recent Trades</h2>

                  <div className="space-y-3">
                    {recentTrades.map((trade, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 flex items-center justify-between hover:border-cyan-400/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                              trade.side === "BUY"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {trade.side}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{trade.pair}</div>
                            <div className="text-slate-400 text-sm">{trade.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-mono">${trade.price}</div>
                          <div className="text-slate-400 text-sm">{trade.amount} APT</div>
                        </div>
                        <div className="text-green-400 font-semibold">{trade.pnl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CLOB Advantage Card */}
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl shadow-green-500/5">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg shadow-green-500/30">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-white mb-2">CLOB Execution Savings</h3>
                      <p className="text-slate-300 mb-4">
                        Your vault saved <span className="text-green-400">$54.30</span> this month by using
                        Kana Perps CLOB instead of traditional AMMs.
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-3">
                          <div className="text-slate-400 text-xs mb-1">Avg Slippage</div>
                          <div className="text-white">0.08%</div>
                          <div className="text-green-400 text-xs">vs 0.53% AMM</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-3">
                          <div className="text-slate-400 text-xs mb-1">Fill Rate</div>
                          <div className="text-white">98.7%</div>
                          <div className="text-green-400 text-xs">+5.2% vs AMM</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-3">
                          <div className="text-slate-400 text-xs mb-1">Total Saved</div>
                          <div className="text-white">$54.30</div>
                          <div className="text-green-400 text-xs">This month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Actions */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/5">
                  <h3 className="text-lg text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Amount in APT"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-800/50 border border-blue-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                    />
                    <button
                      onClick={handleDeposit}
                      disabled={loading || !depositAmount}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
                    >
                      Deposit Funds
                    </button>

                    <input
                      type="number"
                      placeholder="Amount in APT"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-800/50 border border-blue-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                    />
                    <button
                      onClick={handleWithdraw}
                      disabled={loading || !withdrawAmount}
                      className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-blue-500/30 hover:border-cyan-400/50 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      Withdraw
                    </button>

                    <button
                      onClick={handleToggleVault}
                      disabled={loading}
                      className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-blue-500/30 hover:border-cyan-400/50 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      {vaultInfo.is_active ? "Pause Vault" : "Activate Vault"}
                    </button>
                  </div>
                </div>

                {/* Order Book */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-white">Order Book</h3>
                    <span className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                      Kana CLOB
                    </span>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-slate-400 text-xs mb-1">APT/USDC</div>
                    <div className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      $10.53
                    </div>
                    <div className="text-green-400 text-sm font-semibold">+0.32%</div>
                  </div>

                  {/* Asks */}
                  <div className="space-y-1 mb-4">
                    {orderBook.asks
                      .slice()
                      .reverse()
                      .map((level, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-0 bg-red-500/10"
                            style={{ width: `${(level.total / getMaxTotal()) * 100}%` }}
                          />
                          <div className="relative flex justify-between text-xs py-1.5 px-2">
                            <span className="text-red-400 font-mono font-semibold">{level.price}</span>
                            <span className="text-slate-400 font-mono">{level.size}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="border-t border-blue-500/20 mb-4"></div>

                  {/* Bids */}
                  <div className="space-y-1">
                    {orderBook.bids.map((level, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-0 bg-green-500/10"
                          style={{ width: `${(level.total / getMaxTotal()) * 100}%` }}
                        />
                        <div className="relative flex justify-between text-xs py-1.5 px-2">
                          <span className="text-green-400 font-mono font-semibold">{level.price}</span>
                          <span className="text-slate-400 font-mono">{level.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-500/20">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Spread:</span>
                      <span className="text-cyan-400 font-mono font-semibold">
                        $
                        {(
                          Number.parseFloat(orderBook.asks[0]?.price || "0") -
                          Number.parseFloat(orderBook.bids[0]?.price || "0")
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trader Info */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/5">
                  <h3 className="text-lg text-white mb-4">Following</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🐋</div>
                    <div>
                      <div className="text-white font-semibold">{traderName}</div>
                      <div className="text-cyan-400 text-sm">Trend Following</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-2">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-cyan-400 font-semibold">{winRate}</span>
                    </div>
                    <div className="flex justify-between bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-2">
                      <span className="text-slate-400">Total Followers:</span>
                      <span className="text-white font-semibold">{followerCount}</span>
                    </div>
                    <div className="flex justify-between bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-2">
                      <span className="text-slate-400">30D PnL:</span>
                      <span className="text-green-400 font-semibold">+18.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
