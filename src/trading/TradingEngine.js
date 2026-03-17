export class TradingEngine {
  constructor(initialBalance = 1000) {
    this.balance = initialBalance
    this.initialBalance = initialBalance
    this.position = null
    this.history = []
    this.subscribers = []
  }

  subscribe(fn) { this.subscribers.push(fn) }
  _notify() { this.subscribers.forEach(fn => fn(this.getState())) }

  getState() {
    return {
      balance: this.balance,
      position: this.position,
      history: [...this.history],
    }
  }

  openPosition(type, amount, leverage, entryPrice, stopLoss = null, takeProfit = null) {
  if (this.position) return { error: 'Ya tienes una posición abierta' }
  if (amount > this.balance) return { error: 'Saldo insuficiente' }
  if (amount <= 0) return { error: 'Monto inválido' }

  // Validate SL/TP
  if (stopLoss !== null) {
    if (type === 'long' && stopLoss >= entryPrice)
      return { error: 'Stop Loss debe ser menor al precio de entrada en LONG' }
    if (type === 'short' && stopLoss <= entryPrice)
      return { error: 'Stop Loss debe ser mayor al precio de entrada en SHORT' }
  }

  if (takeProfit !== null) {
    if (type === 'long' && takeProfit <= entryPrice)
      return { error: 'Take Profit debe ser mayor al precio de entrada en LONG' }
    if (type === 'short' && takeProfit >= entryPrice)
      return { error: 'Take Profit debe ser menor al precio de entrada en SHORT' }
  }

  
  const maintenanceMargin = 0.005
const liqPrice = type === 'long'
  ? entryPrice * (1 - (1 / leverage) + maintenanceMargin)
  : entryPrice * (1 + (1 / leverage) - maintenanceMargin)

  this.position = {
    type,
    amount,
    leverage,
    entryPrice,
    liqPrice,
    stopLoss,
    takeProfit,
    size: amount * leverage,
    openTime: Date.now(),
  }

console.log('Position created:', this.position.stopLoss, this.position.takeProfit)


  this.balance -= amount
  this._notify()
  return { success: true, position: this.position }
}



updatePnL(currentPrice) {
  if (!this.position) return null
  const { type, entryPrice, size, stopLoss, takeProfit } = this.position
  const priceDiff = currentPrice - entryPrice
  const pnl = type === 'long'
    ? (priceDiff / entryPrice) * size
    : -(priceDiff / entryPrice) * size

  this.position.currentPrice = currentPrice
  this.position.pnl = pnl
  this.position.pnlPct = (pnl / this.position.amount) * 100

  // Check liquidation
  const liquidated = type === 'long'
    ? currentPrice <= this.position.liqPrice
    : currentPrice >= this.position.liqPrice
  if (liquidated) return this._closePosition(currentPrice, true)

  // Check Stop Loss
  if (stopLoss !== null) {
    const slHit = type === 'long'
      ? currentPrice <= stopLoss
      : currentPrice >= stopLoss
    if (slHit) return this._closePosition(currentPrice, false, 'sl')
  }

  // Check Take Profit
  if (takeProfit !== null) {
    const tpHit = type === 'long'
      ? currentPrice >= takeProfit
      : currentPrice <= takeProfit
    if (tpHit) return this._closePosition(currentPrice, false, 'tp')
  }

  this._notify()
  return null
}


  closePosition(currentPrice) {
    if (!this.position) return null
    return this._closePosition(currentPrice, false)
  }

  _closePosition(currentPrice, liquidated, trigger = 'manual') {
  const pos = this.position
  const { type, entryPrice, size, amount } = pos
  const priceDiff = currentPrice - entryPrice
  const pnl = type === 'long'
    ? (priceDiff / entryPrice) * size
    : -(priceDiff / entryPrice) * size

  const returned = liquidated ? 0 : Math.max(0, amount + pnl)
  this.balance += returned

  const record = {
    id: Date.now(),
    type,
    amount,
    leverage: pos.leverage,
    entryPrice,
    closePrice: currentPrice,
    pnl: liquidated ? -amount : pnl,
    liquidated,
    trigger, // 'manual' | 'sl' | 'tp' | liquidated
    duration: Date.now() - pos.openTime,
  }

  this.history.unshift(record)
  if (this.history.length > 20) this.history.pop()
  this.position = null
  this._notify()

  return { liquidated, pnl: record.pnl, trigger, record }
}


}