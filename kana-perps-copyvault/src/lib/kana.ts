// Kana Perps REST API Integration
// Documentation: https://docs.kanalabs.io/perpetual-futures/kana-perps/api-docs/kana-perps-typescript-rest-api

const KANA_BASE_URL = process.env.NEXT_PUBLIC_KANA_API_URL || 'https://perps-tradeapi.kanalabs.io';
const KANA_WS_ORDERBOOK_URL = 'wss://perps-sdk-ws.kanalabs.io/wsOrderBook';
const API_KEY = process.env.NEXT_PUBLIC_KANA_API_KEY || '';

// APT/USDC Market ID (301 for WebSocket, 1338 for REST API)
const APT_MARKET_ID_WS = '301';
const APT_MARKET_ID = '1338';

// Types
export interface KanaMarketInfo {
  __variant__: string;
  base_decimals: number;
  base_name: string;
  counter: string;
  creator: string;
  fee_address: string;
  is_recognised: boolean;
  last_updated: string;
  lot_size: string;
  maintenance_margin: string;
  market_address: string;
  market_id: string;
  market_status: number;
  max_leverage: string;
  max_lots: string;
  max_position_value: string;
  min_lots: string;
  quote_decimals: number;
  quote_precision: number;
  tick_size: string;
}

export interface KanaPosition {
  address: string;
  market_id: string;
  leverage: number;
  trade_side: boolean; // true for LONG, false for SHORT
  size: string;
  available_order_size: string;
  value: string;
  entry_price: string;
  liq_price: string;
  margin: string;
  tp: string;
  sl: string;
  trade_id: string;
  last_updated?: number;
  transaction_version?: number;
}

export interface KanaOrder {
  address: string;
  market_id: string;
  leverage: number;
  order_type: number;
  timestamp: number;
  price: string;
  total_size: string;
  remaining_size: string;
  order_value: string;
  order_id: string;
  trade_id: string;
  last_updated: number;
  transaction_version: number;
}

export interface KanaAccountBalance {
  success: boolean;
  message: string;
  data: number;
}

export interface KanaOrderStatus {
  address: string;
  market_id: string;
  leverage: number;
  order_type: number;
  timestamp: number;
  is_market_order: boolean;
  size: string;
  price: string;
  order_value: string;
  status: 'Open' | 'Filled' | 'Partially Filled' | 'Cancelled';
  order_id: string;
  trade_id: string;
  last_updated: number;
  transaction_version: number;
  total_filled?: string;
  remaining_size?: string;
  total_trade_size?: string;
}

export interface KanaTradeHistory {
  address: string;
  leverage: number;
  market_id: string;
  timestamp: number;
  size: string;
  order_type: number;
  price: string;
  order_value: string;
  pnl: string;
  fee: string;
  trade_id: string;
  last_updated: number;
  transaction_version: number;
  entry_price: string | null;
  order_id: string;
}

export interface KanaMarketPrice {
  bestAskPrice: number;
  bestBidPrice: number;
}

// OrderBook Types for WebSocket
export interface OrderBookLevel {
  price: number;
  size: number;
  total?: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

// API Helper
async function kanaRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${KANA_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kana API Error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * WebSocket OrderBook Client for APT/USDC market
 * Connects to the Kana Perps WebSocket and streams real-time orderbook data
 */
export class OrderBookClient {
  private ws: WebSocket | null = null;
  private marketId: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private onMessageCallback?: (orderBook: any) => void;
  private onErrorCallback?: (error: Error) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;

  constructor(marketId: string = APT_MARKET_ID_WS) {
    this.marketId = marketId;
  }

  connect(): void {
    const wsUrl = `${KANA_WS_ORDERBOOK_URL}?marketId=${this.marketId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[OrderBook Client] Connected to the server');
        this.reconnectAttempts = 0;
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send('Request data from endpoint');
        }

        if (this.onConnectedCallback) {
          this.onConnectedCallback();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString());
          
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (error) {
          console.error('[OrderBook Client] Error parsing message:', error);
          if (this.onErrorCallback) {
            this.onErrorCallback(error as Error);
          }
        }
      };

      this.ws.onerror = (error) => {
        console.error('[OrderBook Client] WebSocket error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('WebSocket connection error'));
        }
      };

      this.ws.onclose = () => {
        console.log('[OrderBook Client] Disconnected from the server');
        
        if (this.onDisconnectedCallback) {
          this.onDisconnectedCallback();
        }

        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[OrderBook Client] Connection error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[OrderBook Client] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[OrderBook Client] Reconnecting in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(callback: (orderBook: any) => void): void {
    this.onMessageCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Get market information for APT/USDC
 */
export async function getMarketInfo(marketId: string = APT_MARKET_ID): Promise<KanaMarketInfo> {
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaMarketInfo[] }>(
    `/getMarketInfo?marketId=${marketId}`
  );
  return response.data[0];
}

/**
 * Get all perpetual market assets
 */
export async function getAllMarkets(): Promise<KanaMarketInfo[]> {
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaMarketInfo[] }>(
    '/getPerpetualAssetsInfo/allMarkets'
  );
  return response.data;
}

/**
 * Get wallet account balance (USDC balance in wallet)
 */
export async function getWalletAccountBalance(userAddress: string): Promise<number> {
  const response = await kanaRequest<{ success: boolean; message: string; data: number }>(
    `/getWalletAccountBalance?userAddress=${userAddress}`
  );
  return response.data;
}

/**
 * Get profile balance snapshot (USDC balance in trading account)
 */
export async function getProfileBalanceSnapshot(userAddress: string): Promise<number> {
  const response = await kanaRequest<{ success: boolean; message: string; data: number }>(
    `/getProfileBalanceSnapshot?userAddress=${userAddress}`
  );
  return response.data;
}

/**
 * Get net profile balance (includes available + pending from closed positions)
 */
export async function getNetProfileBalance(userAddress: string): Promise<number> {
  const response = await kanaRequest<{ success: boolean; message: string; data: number }>(
    `/getNetProfileBalance?userAddress=${userAddress}`
  );
  return response.data;
}

/**
 * Get profile address for a wallet address
 */
export async function getProfileAddress(userAddress: string): Promise<string> {
  const response = await kanaRequest<{ success: boolean; message: string; data: string }>(
    `/getProfileAddress?userAddress=${userAddress}`
  );
  return response.data;
}

/**
 * Get user's open positions
 */
export async function getPositions(userAddress: string, marketId?: string): Promise<KanaPosition[]> {
  const url = marketId 
    ? `/getPositions?userAddress=${userAddress}&marketId=${marketId}`
    : `/getPositions?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaPosition[] }>(url);
  return response.data;
}

/**
 * Get user's positions from contract (real-time from blockchain)
 */
export async function getPositionsFromContract(userAddress: string, marketId?: string): Promise<KanaPosition[]> {
  const url = marketId 
    ? `/getPositionsFromContract?userAddress=${userAddress}&marketId=${marketId}`
    : `/getPositionsFromContract?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaPosition[] }>(url);
  return response.data;
}

/**
 * Get user's open orders
 */
export async function getOpenOrders(userAddress: string, marketId?: string): Promise<KanaOrder[]> {
  const url = marketId 
    ? `/getOpenOrders?userAddress=${userAddress}&marketId=${marketId}`
    : `/getOpenOrders?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaOrder[] }>(url);
  return response.data;
}

/**
 * Get user's open orders from contract (real-time from blockchain)
 */
export async function getOpenOrdersFromContract(userAddress: string, marketId?: string): Promise<KanaOrder[]> {
  const url = marketId 
    ? `/getOpenOrdersFromContract?userAddress=${userAddress}&marketId=${marketId}`
    : `/getOpenOrdersFromContract?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaOrder[] }>(url);
  return response.data;
}

/**
 * Get all open order IDs for a user
 */
export async function getAllOpenOrderIds(userAddress: string, marketId?: string): Promise<string[]> {
  const url = marketId 
    ? `/getAllOpenOrderIds?userAddress=${userAddress}&marketId=${marketId}`
    : `/getAllOpenOrderIds?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: string[] }>(url);
  return response.data;
}

/**
 * Get order history
 */
export async function getOrderHistory(userAddress: string, marketId?: string): Promise<KanaOrder[]> {
  const url = marketId 
    ? `/getOrderHistory?userAddress=${userAddress}&marketId=${marketId}`
    : `/getOrderHistory?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaOrder[] }>(url);
  return response.data;
}

/**
 * Get trade history
 */
export async function getTradeHistory(userAddress: string, marketId?: string): Promise<KanaTradeHistory[]> {
  const url = marketId 
    ? `/getTradeHistory?userAddress=${userAddress}&marketId=${marketId}`
    : `/getTradeHistory?userAddress=${userAddress}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaTradeHistory[] }>(url);
  return response.data;
}

/**
 * Get order status by order ID
 */
export async function getOrderStatusByOrderId(marketId: string, orderId: string): Promise<KanaOrderStatus> {
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaOrderStatus }>(
    `/fetchOrderStatusById?marketId=${marketId}&orderId=${orderId}`
  );
  return response.data;
}

/**
 * Get market price (best bid and ask)
 */
export async function getMarketPrice(marketId: string = APT_MARKET_ID): Promise<KanaMarketPrice> {
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaMarketPrice }>(
    `/getMarketPrice?marketId=${marketId}`
  );
  return response.data;
}

/**
 * Get last execution price
 */
export async function getLastExecutionPrice(marketId: string = APT_MARKET_ID): Promise<number> {
  const response = await kanaRequest<{ success: boolean; message: string; data: number }>(
    `/getLastPlacedPrice?marketId=${marketId}`
  );
  return response.data;
}

/**
 * Get all trades for a market
 */
export async function getAllTrades(marketId: string = APT_MARKET_ID): Promise<any[]> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any[] }>(
    `/getAllTrades?marketId=${marketId}`
  );
  return response.data;
}

/**
 * Get fills for a given timestamp range
 */
export async function getFillsForGivenTimestamp(
  userAddress: string,
  fromTimestamp: number,
  toTimestamp: number,
  marketId?: string
): Promise<KanaTradeHistory[]> {
  const url = marketId 
    ? `/getFillsForGivenTimestamp?userAddress=${userAddress}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}&marketId=${marketId}`
    : `/getFillsForGivenTimestamp?userAddress=${userAddress}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: KanaTradeHistory[] }>(url);
  return response.data;
}

/**
 * Get deposit and withdraw history
 */
export async function getDepositAndWithdrawHistory(userAddress: string): Promise<any[]> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any[] }>(
    `/getDepositAndWithdrawHistory?userAddress=${userAddress}`
  );
  return response.data;
}

/**
 * Get funding history
 */
export async function getFundingHistory(
  userAddress: string,
  marketId?: string,
  offset?: number,
  limit?: number,
  order?: 'asc' | 'desc'
): Promise<any[]> {
  let url = `/getFundingHistory?userAddress=${userAddress}`;
  if (marketId) url += `&marketId=${marketId}`;
  if (offset !== undefined) url += `&offset=${offset}`;
  if (limit !== undefined) url += `&limit=${limit}`;
  if (order) url += `&order=${order}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: any[] }>(url);
  return response.data;
}

/**
 * Get account APT balance
 */
export async function getAccountAptBalance(userAddress: string): Promise<number> {
  const response = await kanaRequest<{ success: boolean; message: string; data: number }>(
    `/getAccountAptBalance?userAddress=${userAddress}`
  );
  return response.data;
}

/**
 * Build deposit transaction payload
 */
export async function buildDepositPayload(userAddress: string, amount: number): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/deposit?userAddress=${userAddress}&amount=${amount}`
  );
  return response.data;
}

/**
 * Build withdraw transaction payload
 */
export async function buildWithdrawPayload(
  marketId: string,
  userAddress: string,
  amount: number
): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/withdrawSpecifiMarket?marketId=${marketId}&userAddress=${userAddress}&amount=${amount}`
  );
  return response.data;
}

/**
 * Build place limit order transaction payload
 */
export async function buildPlaceLimitOrderPayload(
  marketId: string,
  tradeSide: boolean,
  direction: boolean,
  size: number,
  price: number,
  leverage: number,
  restriction?: number,
  takeProfit?: number,
  stopLoss?: number
): Promise<any> {
  let url = `/placeLimitOrder?marketId=${marketId}&tradeSide=${tradeSide}&direction=${direction}&size=${size}&price=${price}&leverage=${leverage}`;
  if (restriction !== undefined) url += `&restriction=${restriction}`;
  if (takeProfit !== undefined) url += `&takeProfit=${takeProfit}`;
  if (stopLoss !== undefined) url += `&stopLoss=${stopLoss}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(url);
  return response.data;
}

/**
 * Build place market order transaction payload
 */
export async function buildPlaceMarketOrderPayload(
  marketId: string,
  tradeSide: boolean,
  direction: boolean,
  size: number,
  leverage: number,
  takeProfit?: number,
  stopLoss?: number
): Promise<any> {
  let url = `/placeMarketOrder?marketId=${marketId}&tradeSide=${tradeSide}&direction=${direction}&size=${size}&leverage=${leverage}`;
  if (takeProfit !== undefined) url += `&takeProfit=${takeProfit}`;
  if (stopLoss !== undefined) url += `&stopLoss=${stopLoss}`;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(url);
  return response.data;
}

/**
 * Build cancel multiple orders transaction payload
 */
export async function buildCancelMultipleOrdersPayload(
  marketId: string,
  cancelOrderIds: string[],
  orderSides: boolean[]
): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    '/cancelMultipleOrders',
    {
      method: 'POST',
      body: JSON.stringify({ marketId, cancelOrderIds, orderSides }),
    }
  );
  return response.data;
}

/**
 * Build place multiple orders transaction payload
 */
export async function buildPlaceMultipleOrdersPayload(
  marketId: string,
  orderTypes: boolean[],
  tradeSides: boolean[],
  directions: boolean[],
  sizes: number[],
  prices: number[],
  leverages: number[],
  restriction?: number,
  takeProfits?: number[],
  stopLosses?: number[]
): Promise<any> {
  const body: any = {
    marketId,
    orderTypes,
    tradeSides,
    directions,
    sizes,
    prices,
    leverages,
  };
  
  if (restriction !== undefined) body.restriction = restriction;
  if (takeProfits) body.takeProfits = takeProfits;
  if (stopLosses) body.stopLosses = stopLosses;
  
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    '/placeMultipleOrders',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
  return response.data;
}

/**
 * Build update take profit transaction payload
 */
export async function buildUpdateTakeProfitPayload(
  marketId: string,
  tradeSide: boolean,
  newTakeProfitPrice: number
): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/updateTakeProfit?marketId=${marketId}&tradeSide=${tradeSide}&newTakeProfitPrice=${newTakeProfitPrice}`
  );
  return response.data;
}

/**
 * Build update stop loss transaction payload
 */
export async function buildUpdateStopLossPayload(
  marketId: string,
  tradeSide: boolean,
  newStopLossPrice: number
): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/updateStopLoss?marketId=${marketId}&tradeSide=${tradeSide}&newStopLossPrice=${newStopLossPrice}`
  );
  return response.data;
}

/**
 * Build add margin transaction payload
 */
export async function buildAddMarginPayload(
  marketId: string,
  tradeSide: boolean,
  amount: number
): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/addMargin?marketId=${marketId}&tradeSide=${tradeSide}&amount=${amount}`
  );
  return response.data;
}

/**
 * Build collapse position transaction payload
 */
export async function buildCollapsePositionPayload(marketId: string): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/collapsePosition?marketId=${marketId}`
  );
  return response.data;
}

/**
 * Build settle PnL transaction payload
 */
export async function buildSettlePnlPayload(userAddress: string, marketId: string): Promise<any> {
  const response = await kanaRequest<{ success: boolean; message: string; data: any }>(
    `/settlePnl?userAddress=${userAddress}&marketId=${marketId}`
  );
  return response.data;
}

/**
 * Calculate potential PnL for a position
 */
export function calculatePnL(
  tradeSide: boolean,
  entryPrice: number,
  currentPrice: number,
  size: number,
  leverage: number
): number {
  const priceDiff = tradeSide 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice;
  
  const pnlPercent = (priceDiff / entryPrice) * leverage;
  const collateralUsed = (size * entryPrice) / leverage;
  
  return collateralUsed * pnlPercent;
}