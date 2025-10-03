"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight, Search, Loader2 } from "lucide-react"
import { getTraderStats, createVault, formatWinRate, type TraderStats } from "@/utils/contractService"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Trader {
  address: string
  name: string
  avatar: string
  followers: number
  aum: number
  winRate: number
  totalTrades: number
  pnl30d: number
  volume24h: number
  strategy: string
  stats?: TraderStats | null
}

export default function TradersPage() {
  const { account, connected, disconnect, signAndSubmitTransaction } = useWallet()

  const [traders, setTraders] = useState<Trader[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"pnl" | "winRate" | "followers" | "aum">("pnl")
  const [loading, setLoading] = useState(false)
  const [creatingVaultFor, setCreatingVaultFor] = useState<string | null>(null)
  const [followModalOpen, setFollowModalOpen] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const [collateral, setCollateral] = useState("")
  const [leverage, setLeverage] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    loadTraders()
  }, [])

  const loadTraders = async () => {
    setLoading(true)
    try {
      const mockTraders: Trader[] = [
        {
          address: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          name: "CryptoWhale",
          avatar: "🐋",
          followers: 234,
          aum: 450000,
          winRate: 72.5,
          totalTrades: 156,
          pnl30d: 18.3,
          volume24h: 125000,
          strategy: "Trend Following",
        },
        {
          address: "0x2345678901bcdef02345678901bcdef02345678901bcdef02345678901bcdef0",
          name: "DeFiMaster",
          avatar: "🚀",
          followers: 189,
          aum: 320000,
          winRate: 68.2,
          totalTrades: 203,
          pnl30d: 15.7,
          volume24h: 98000,
          strategy: "Mean Reversion",
        },
        {
          address: "0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef12",
          name: "AptosAlpha",
          avatar: "⚡",
          followers: 167,
          aum: 280000,
          winRate: 71.8,
          totalTrades: 134,
          pnl30d: 14.2,
          volume24h: 87000,
          strategy: "Momentum",
        },
        {
          address: "0x4567890123def234567890123def234567890123def234567890123def2345",
          name: "YieldHunter",
          avatar: "🎯",
          followers: 145,
          aum: 210000,
          winRate: 65.4,
          totalTrades: 178,
          pnl30d: 12.8,
          volume24h: 76000,
          strategy: "Arbitrage",
        },
        {
          address: "0x5678901234ef345678901234ef345678901234ef345678901234ef34567890",
          name: "QuantTrader",
          avatar: "📊",
          followers: 132,
          aum: 195000,
          winRate: 69.1,
          totalTrades: 221,
          pnl30d: 11.5,
          volume24h: 65000,
          strategy: "Statistical",
        },
      ]

      const tradersWithStats = await Promise.all(
        mockTraders.map(async (trader) => {
          const stats = await getTraderStats(trader.address)
          return {
            ...trader,
            stats,
            followers: stats ? Number(stats.total_followers) : trader.followers,
            totalTrades: stats ? Number(stats.total_positions) : trader.totalTrades,
            winRate: stats ? Number.parseFloat(formatWinRate(stats.win_rate)) : trader.winRate,
          }
        }),
      )

      setTraders(tradersWithStats)
    } catch (error) {
      console.error("Error loading traders:", error)
      setTraders([
        {
          address: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          name: "CryptoWhale",
          avatar: "🐋",
          followers: 234,
          aum: 450000,
          winRate: 72.5,
          totalTrades: 156,
          pnl30d: 18.3,
          volume24h: 125000,
          strategy: "Trend Following",
        },
        {
          address: "0x2345678901bcdef02345678901bcdef02345678901bcdef02345678901bcdef0",
          name: "DeFiMaster",
          avatar: "🚀",
          followers: 189,
          aum: 320000,
          winRate: 68.2,
          totalTrades: 203,
          pnl30d: 15.7,
          volume24h: 98000,
          strategy: "Mean Reversion",
        },
        {
          address: "0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef12",
          name: "AptosAlpha",
          avatar: "⚡",
          followers: 167,
          aum: 280000,
          winRate: 71.8,
          totalTrades: 134,
          pnl30d: 14.2,
          volume24h: 87000,
          strategy: "Momentum",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFollowTrader = async (trader: Trader) => {
    if (!connected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setSelectedTrader(trader)
    setFollowModalOpen(true)
  }

  const handleCreateVault = async () => {
    if (!selectedTrader || !signAndSubmitTransaction) return

    if (!collateral || isNaN(Number(collateral))) {
      alert("Please enter a valid collateral amount")
      return
    }

    if (!leverage || isNaN(Number(leverage)) || Number(leverage) < 1 || Number(leverage) > 20) {
      alert("Invalid leverage. Must be between 1 and 20.")
      return
    }

    try {
      setCreatingVaultFor(selectedTrader.address)

      await createVault(signAndSubmitTransaction, selectedTrader.address, Number(collateral), Number(leverage))

      alert("Vault created successfully! Redirecting to your vault...")
      setFollowModalOpen(false)
      setCollateral("")
      setLeverage("")
      window.location.href = "/vault"
    } catch (error) {
      console.error("Error creating vault:", error)
      alert("Failed to create vault. Please try again.")
    } finally {
      setCreatingVaultFor(null)
    }
  }

  const sortedTraders = [...traders].sort((a, b) => {
    switch (sortBy) {
      case "pnl":
        return b.pnl30d - a.pnl30d
      case "winRate":
        return b.winRate - a.winRate
      case "followers":
        return b.followers - a.followers
      case "aum":
        return b.aum - a.aum
      default:
        return 0
    }
  })

  const filteredTraders = sortedTraders.filter(
    (trader) =>
      trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729] relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />
      <div className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-3xl animate-pulse" />

      <header className="border-b border-blue-500/20 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CopyVault
              </span>
            </a>

            <div className="flex gap-4">
              {connected && account ? (
                <div className="flex gap-2 items-center">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-lg text-white font-mono text-sm">
                    {String(account.address).slice(0, 6)}...{String(account.address).slice(-4)}
                  </div>
                  <a
                    href="/vault"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-500/20"
                  >
                    My Vault
                  </a>
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
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
            Top Traders
          </h1>
          <p className="text-slate-300 text-lg">Follow successful traders and copy their strategies</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 mb-8 shadow-xl shadow-blue-500/5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-blue-500/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
              />
            </div>

            <div className="flex gap-2">
              {[
                { value: "pnl", label: "PnL" },
                { value: "winRate", label: "Win Rate" },
                { value: "followers", label: "Followers" },
                { value: "aum", label: "AUM" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    sortBy === option.value
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-blue-500/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Loading traders...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {filteredTraders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No traders found</p>
              </div>
            ) : (
              filteredTraders.map((trader, idx) => (
                <div
                  key={trader.address}
                  className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-cyan-400 font-bold text-lg">#{idx + 1}</span>
                      </div>
                      <div className="text-5xl">{trader.avatar}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">
                          {trader.name}
                        </h3>
                        <p className="text-slate-400 text-sm font-mono">
                          {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3">
                        <div className="text-slate-400 text-xs mb-1">30D PnL</div>
                        <div
                          className={`text-lg font-bold flex items-center ${trader.pnl30d > 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {trader.pnl30d > 0 ? (
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          )}
                          {trader.pnl30d}%
                        </div>
                      </div>
                      <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3">
                        <div className="text-slate-400 text-xs mb-1">Win Rate</div>
                        <div className="text-lg font-bold text-cyan-400">{trader.winRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3">
                        <div className="text-slate-400 text-xs mb-1">Followers</div>
                        <div className="text-lg font-bold text-white flex items-center">
                          <Users className="w-4 h-4 mr-1 text-cyan-400" />
                          {trader.followers}
                        </div>
                      </div>
                      <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3">
                        <div className="text-slate-400 text-xs mb-1">AUM</div>
                        <div className="text-lg font-bold text-white">${(trader.aum / 1000).toFixed(0)}k</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollowTrader(trader)}
                      disabled={creatingVaultFor === trader.address}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40"
                    >
                      {creatingVaultFor === trader.address ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Follow Trader"
                      )}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-500/20 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                      <span className="text-slate-400">
                        Strategy: <span className="text-cyan-400 font-medium">{trader.strategy}</span>
                      </span>
                      <span className="text-slate-400">
                        Total Trades: <span className="text-white font-medium">{trader.totalTrades}</span>
                      </span>
                    </div>
                    <div className="text-slate-400">
                      24h Volume:{" "}
                      <span className="text-white font-medium">${(trader.volume24h / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Dialog open={followModalOpen} onOpenChange={setFollowModalOpen}>
        <DialogContent className="bg-slate-900 border border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Follow {selectedTrader?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Set up your vault to copy this trader's strategies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="collateral" className="text-slate-300">
                Initial Collateral (APT)
              </Label>
              <Input
                id="collateral"
                type="number"
                placeholder="e.g., 10"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                className="bg-slate-800 border-blue-500/30 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="leverage" className="text-slate-300">
                Max Leverage (1-20)
              </Label>
              <Input
                id="leverage"
                type="number"
                placeholder="e.g., 5"
                min="1"
                max="20"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="bg-slate-800 border-blue-500/30 text-white mt-2"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-slate-300">
                You will deposit <span className="text-cyan-400 font-bold">{collateral || "0"} APT</span> with a max
                leverage of <span className="text-cyan-400 font-bold">{leverage || "0"}x</span>
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setFollowModalOpen(false)}
                variant="outline"
                className="flex-1 border-blue-500/30 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateVault}
                disabled={!collateral || !leverage || creatingVaultFor !== null}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                {creatingVaultFor ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Vault"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
