"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  Users,
  Zap,
  Shield,
  ArrowRight,
  BarChart3,
  Lock,
  Rocket,
  Target,
  Activity,
  DollarSign,
  Wallet,
  Globe,
  Layers,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import { WalletSelector } from "@/components/connect-wallet"

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const connectWallet = async () => {
    if (typeof window !== "undefined" && "aptos" in window) {
      try {
        const wallet = (window as any).aptos
        const response = await wallet.connect()
        setAddress(response.address)
        setIsConnected(true)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      }
    } else {
      alert("Please install Petra Wallet")
    }
  }

  const stats = [
    { label: "Total Value Locked", value: "$2.4M", change: "+12.5%", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Active Traders", value: "234", change: "+8.2%", icon: <Users className="w-5 h-5" /> },
    { label: "Total Followers", value: "1,892", change: "+15.3%", icon: <Activity className="w-5 h-5" /> },
    { label: "Avg. Win Rate", value: "67%", change: "+2.1%", icon: <Target className="w-5 h-5" /> },
    { label: "24h Volume", value: "$847K", change: "+23.4%", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Active Vaults", value: "156", change: "+18.7%", icon: <Wallet className="w-5 h-5" /> },
  ]

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "CLOB-Powered Execution",
      description: "Superior price execution using Kana Perps' Central Limit Order Book vs traditional AMMs",
      details: "Experience minimal slippage and optimal price discovery with institutional-grade order matching",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Copy Trading",
      description: "Follow top traders and automatically replicate their strategies with one click",
      details: "Access proven strategies from verified traders with transparent performance metrics",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Non-Custodial Vaults",
      description: "Your funds stay in your control with smart contract vaults on Aptos",
      details: "Audited smart contracts ensure your assets remain secure and under your control",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-Time Analytics",
      description: "Track performance, compare against traders, and optimize your strategy",
      details: "Advanced dashboards with live P&L tracking, risk metrics, and performance insights",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Bank-Grade Security",
      description: "Multi-signature wallets and audited smart contracts protect your assets",
      details: "Regular security audits and bug bounty programs ensure maximum protection",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Instant Execution",
      description: "Lightning-fast trade execution on Aptos blockchain infrastructure",
      details: "Sub-second transaction finality with minimal gas fees on Aptos network",
    },
  ]

  const benefits = [
    {
      title: "Zero Coding Required",
      description: "Start copy trading in minutes without any technical knowledge",
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: "Transparent Fees",
      description: "Only 2% performance fee on profits. No hidden charges",
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: "Withdraw Anytime",
      description: "Full control over your funds with instant withdrawals",
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: "Risk Management",
      description: "Set stop-loss limits and position size controls",
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.15), transparent 40%)`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>

      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 blur-xl bg-cyan-400/30"></div>
              </div>
              <span className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CopyVault
              </span>
              <span className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full font-medium">
                Powered by Kana Perps
              </span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Features
              </a>
              <a href="/traders" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Traders
              </a>
              <a href="/vault" className="text-slate-300 hover:text-cyan-400 transition-colors">
                My Vault
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-cyan-400 transition-colors">
                How It Works
              </a>
            </nav>

            <WalletSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">Next-Gen Copy Trading Platform</span>
              </div>
              <h1 className="text-5xl font-thin text-white mb-6 leading-tight">
                Copy Top Traders on
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Aptos
                </span>
              </h1>
              <p className="text-md text-slate-300 mb-4 leading-relaxed">
                Follow successful traders and automatically replicate their strategies using Kana Perps' CLOB for
                superior execution. No manual trading required.
              </p>
              <p className="text-sm text-cyan-400 mb-10">
                Join 1,892+ traders earning passive income through automated copy trading
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => (window.location.href = "/traders")}
                  className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center"
                >
                  Browse Traders
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => (window.location.href = "/vault")}
                  className="bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/20 hover:border-cyan-500/40 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all backdrop-blur-sm"
                >
                  Access My Vault
                </button>
              </div>
            </div>

            {/* Right side - Image placeholder */}
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-cyan-500/20 bg-slate-900">
                <img
                  src="/hero.png"
                  alt="Kana Perps Trading Dashboard"
                  className="w-full h-full object-cover"
                />
                {/* Overlay glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-500/20"></div>
                {/* Floating stats cards */}
                <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Live Performance</span>
                  </div>
                  <div className="text-2xl text-white">+24.5%</div>
                  <div className="text-xs text-slate-400">This Month</div>
                </div>
                <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">Active Traders</span>
                  </div>
                  <div className="text-2xl text-white">234</div>
                  <div className="text-xs text-slate-400">Following</div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Stats grid below hero */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group bg-slate-900/50 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  {stat.icon}
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
                <div className="text-3xl text-white mb-2">{stat.value}</div>
                <div className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Platform Features</span>
            </div>
            <h2 className="text-5xl text-white mb-6">Powerful Features</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              The most advanced copy trading platform on Aptos blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-900/50 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 w-14 h-14 rounded-xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 mb-4">{feature.description}</p>
                <p className="text-sm text-cyan-400/80">{feature.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOB Advantage Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-3xl p-12 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cyan-400 font-medium">Technology Advantage</span>
                </div>
                <h2 className="text-4xl text-white mb-6">CLOB vs AMM: Better Execution</h2>
                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                  Traditional copy trading platforms use AMMs (Automated Market Makers) which suffer from slippage and
                  poor execution. CopyVault uses Kana Perps' Central Limit Order Book for:
                </p>
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Better Prices:</strong> Limit orders at your desired price with
                      institutional-grade matching
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Lower Slippage:</strong> No price impact on large orders, even
                      during volatile markets
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Transparent:</strong> See the full order book depth and liquidity
                      in real-time
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Advanced Orders:</strong> Support for stop-loss, take-profit, and
                      conditional orders
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-slate-950/80 rounded-2xl p-8 border border-cyan-500/20 backdrop-blur-sm">
                <h3 className="text-white mb-6 text-xl flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  Average Savings per Trade
                </h3>
                <div className="text-6xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
                  0.45%
                </div>
                <p className="text-slate-400 mb-8 text-lg">vs AMM-based copy trading platforms</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-cyan-500/10">
                    <span className="text-slate-300">$1,000 trade</span>
                    <span className="text-green-400 text-lg">Save $4.50</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-cyan-500/10">
                    <span className="text-slate-300">$10,000 trade</span>
                    <span className="text-green-400 text-lg">Save $45.00</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-cyan-500/10">
                    <span className="text-slate-300">100 trades/month</span>
                    <span className="text-green-400 text-lg">Save $450+</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <p className="text-cyan-400 text-sm text-center">
                    💡 Savings compound over time, significantly boosting your returns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Simple Process</span>
            </div>
            <h2 className="text-5xl text-white mb-6">How It Works</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">Start copy trading in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "1",
                title: "Browse Traders",
                description:
                  "Explore our leaderboard of top traders. View their performance, win rate, and trading strategy.",
                details: "Filter by risk level, returns, and trading style to find the perfect match",
                icon: <Users className="w-6 h-6" />,
              },
              {
                step: "2",
                title: "Create Vault",
                description:
                  "Deposit funds and choose a trader to follow. Your vault automatically mirrors their trades.",
                details: "Set your investment amount and risk parameters with full control",
                icon: <Wallet className="w-6 h-6" />,
              },
              {
                step: "3",
                title: "Earn Returns",
                description:
                  "Sit back and watch. Your vault replicates trades using Kana Perps CLOB for optimal execution.",
                details: "Monitor performance in real-time and withdraw anytime",
                icon: <TrendingUp className="w-6 h-6" />,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">
                      {item.step}
                    </div>
                    <div className="text-cyan-400">{item.icon}</div>
                  </div>
                  <h3 className="text-2xl text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400 mb-4 leading-relaxed">{item.description}</p>
                  <p className="text-sm text-cyan-400/80">{item.details}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-cyan-500/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => (window.location.href = "/traders")}
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 inline-flex items-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-cyan-500/20 rounded-3xl p-12 backdrop-blur-sm">
            <div className="text-center mb-12">
              <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-4xl text-white mb-4">Bank-Grade Security</h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Your assets are protected by multiple layers of security
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-white mb-2 text-lg">Non-Custodial</h3>
                <p className="text-slate-400">You maintain full control of your private keys and assets at all times</p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-white mb-2 text-lg">Audited Contracts</h3>
                <p className="text-slate-400">
                  Smart contracts audited by leading security firms with bug bounty programs
                </p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-white mb-2 text-lg">Real-Time Monitoring</h3>
                <p className="text-slate-400">
                  24/7 monitoring and automated risk management systems protect your investments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <TrendingUp className="w-7 h-7 text-cyan-400" />
                  <div className="absolute inset-0 blur-xl bg-cyan-400/30"></div>
                </div>
                <span className="text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  CopyVault
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                The premier copy trading platform on Aptos, powered by Kana Perps CLOB for superior execution.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <a href="/traders" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Browse Traders
                  </a>
                </li>
                <li>
                  <a href="/vault" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> My Vault
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-6 text-lg">Resources</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <a
                    href="https://docs.kana.exchange"
                    target="_blank"
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2"
                    rel="noreferrer"
                  >
                    <ChevronRight className="w-4 h-4" /> Kana Perps Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://aptos.dev"
                    target="_blank"
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2"
                    rel="noreferrer"
                  >
                    <ChevronRight className="w-4 h-4" /> Aptos Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Security Audits
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> API Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-6 text-lg">Built With</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center gap-2">⚡ Aptos Blockchain</li>
                <li className="flex items-center gap-2">📊 Kana Perps CLOB</li>
                <li className="flex items-center gap-2">🔐 Non-Custodial Vaults</li>
                <li className="flex items-center gap-2">🚀 Next.js & React</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">© 2025 CopyVault. Built for Aptos DeFi Hackathon.</div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
