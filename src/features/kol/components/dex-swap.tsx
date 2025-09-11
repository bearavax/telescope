"use client";
import React, { useState, useEffect } from "react";
import { ArrowDownUp, TrendingUp, Loader2, Zap, Settings2 } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, Address } from "viem";

interface Token {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  emoji: string;
  price: number;
}

const POPULAR_TOKENS: Token[] = [
  { symbol: "AVAX", name: "Avalanche", address: "0x0000000000000000000000000000000000000000" as Address, decimals: 18, emoji: "🔺", price: 35.42 },
  { symbol: "USDC", name: "USD Coin", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as Address, decimals: 6, emoji: "💵", price: 1.00 },
  { symbol: "WETH.e", name: "Wrapped Ether", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB" as Address, decimals: 18, emoji: "💎", price: 3720.50 },
  { symbol: "BTC.b", name: "Bitcoin", address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50" as Address, decimals: 8, emoji: "🪙", price: 100850.00 },
  { symbol: "JOE", name: "JoeToken", address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd" as Address, decimals: 18, emoji: "⚡", price: 0.45 }
];

const QUICK_AMOUNTS = [0.1, 0.5, 1, 5];

export function DEXSwap() {
  const { address, isConnected } = useAccount();
  const [fromToken, setFromToken] = useState<Token>(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(POPULAR_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  const { data: fromBalance } = useBalance({
    address: address,
    token: fromToken.address === "0x0000000000000000000000000000000000000000" ? undefined : fromToken.address,
  });

  // Auto-calculate output amount
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const fromValue = parseFloat(fromAmount) * fromToken.price;
      const calculatedToAmount = fromValue / toToken.price;
      setToAmount(calculatedToAmount.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleQuickAmount = (percentage: number) => {
    if (fromBalance) {
      const balance = parseFloat(formatUnits(fromBalance.value, fromToken.decimals));
      const amount = (balance * percentage).toFixed(6);
      setFromAmount(amount);
    }
  };

  const handleExecuteSwap = async () => {
    if (!isConnected) {
      alert("Connect wallet first");
      return;
    }
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      alert(`Swapped ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`);
      setFromAmount("");
    }, 2000);
  };

  const canSwap = fromAmount && toAmount && parseFloat(fromAmount) > 0 && isConnected;

  return (
    <div className="w-full space-y-6">
      {/* Swap Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-1">⚡ Token Swap</h2>
            <p className="text-zinc-600">Trade tokens instantly with best rates</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-zinc-100 rounded-lg px-3 py-1">
            <Settings2 className="w-4 h-4 text-zinc-600" />
            <span className="text-zinc-700">{slippage}% slippage</span>
          </div>
        </div>

        {/* Quick Slippage Settings */}
        <div className="flex gap-2">
          <span className="text-sm text-zinc-600 self-center mr-2">Slippage:</span>
          {[0.1, 0.5, 1.0].map((value) => (
            <button
              key={value}
              onClick={() => setSlippage(value)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                slippage === value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      {/* Main Swap Interface */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-zinc-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-600">From</span>
              {isConnected && fromBalance && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">Balance: {parseFloat(formatUnits(fromBalance.value, fromToken.decimals)).toFixed(4)}</span>
                  <button
                    onClick={() => handleQuickAmount(1)}
                    className="text-blue-600 hover:text-blue-700 text-xs"
                  >
                    MAX
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 bg-transparent text-2xl font-medium outline-none"
              />
              
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 min-w-[120px]">
                <span className="text-2xl">{fromToken.emoji}</span>
                <div>
                  <p className="font-bold text-sm">{fromToken.symbol}</p>
                  <p className="text-xs text-zinc-500">${fromToken.price}</p>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-3">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setFromAmount(amount.toString())}
                  className="px-3 py-1 bg-white rounded text-sm hover:bg-zinc-100 transition-colors"
                >
                  {amount} {fromToken.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 bg-white rounded-full border-2 border-zinc-200 hover:border-blue-300 hover:rotate-180 transition-all duration-300"
            >
              <ArrowDownUp className="w-5 h-5 text-zinc-600" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-zinc-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-600">To</span>
              <span className="text-zinc-600">≈ ${toAmount && toToken ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00'}</span>
            </div>
            
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="flex-1 bg-transparent text-2xl font-medium outline-none text-zinc-700"
              />
              
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 min-w-[120px]">
                <span className="text-2xl">{toToken.emoji}</span>
                <div>
                  <p className="font-bold text-sm">{toToken.symbol}</p>
                  <p className="text-xs text-zinc-500">${toToken.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium mb-2">From Token</p>
              <div className="grid grid-cols-1 gap-2">
                {POPULAR_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setFromToken(token)}
                    disabled={token.symbol === toToken.symbol}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      fromToken.symbol === token.symbol
                        ? "bg-blue-100 text-blue-700"
                        : token.symbol === toToken.symbol
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : "hover:bg-zinc-100"
                    }`}
                  >
                    <span className="text-lg">{token.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{token.symbol}</p>
                      <p className="text-xs text-zinc-500">${token.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">To Token</p>
              <div className="grid grid-cols-1 gap-2">
                {POPULAR_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setToToken(token)}
                    disabled={token.symbol === fromToken.symbol}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      toToken.symbol === token.symbol
                        ? "bg-blue-100 text-blue-700"
                        : token.symbol === fromToken.symbol
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : "hover:bg-zinc-100"
                    }`}
                  >
                    <span className="text-lg">{token.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{token.symbol}</p>
                      <p className="text-xs text-zinc-500">${token.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {fromAmount && toAmount && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-blue-600 font-medium">Rate</p>
                  <p className="text-blue-800">1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Fee</p>
                  <p className="text-blue-800">0.3%</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Slippage</p>
                  <p className="text-blue-800">{slippage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Execute Swap */}
          <button
            onClick={handleExecuteSwap}
            disabled={!canSwap || isSwapping}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              !canSwap
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : isSwapping
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]"
            }`}
          >
            {isSwapping ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Swapping...
              </div>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : !fromAmount ? (
              "Enter Amount"
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Swap Tokens
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Swaps
        </h3>
        <div className="space-y-3">
          {[
            { from: "100 AVAX", to: "3,542 USDC", ago: "2m" },
            { from: "500 USDC", to: "0.134 WETH.e", ago: "5m" },
            { from: "0.5 BTC.b", to: "1,425 AVAX", ago: "8m" }
          ].map((swap, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{swap.from} → {swap.to}</span>
              </div>
              <span className="text-sm text-zinc-500">{swap.ago} ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}