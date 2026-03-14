export class TradingEngine {
  constructor(initialBalance = 10000) {
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

  openPosition(type, amount, leverage, entryPrice) {
    if (this.position) return { error: 'Ya tienes una posición abierta' }
    if (amount > this.balance) return { error: 'Saldo insuficiente' }
    if (amount <= 0) return { error: 'Monto inválido' }

    // Liquidation price calculation (same as Binance perpetuals)
    // Long:  liquidation = entryPrice * (1 - 1/leverage + maintenanceMargin)
    // Short: liquidation = entryPrice * (1 + 1/leverage - maintenanceMargin)
    const maintenanceMargin = 0.004
    const liqPrice = type === 'long'
      ? entryPrice * (1 - 1 / leverage + maintenanceMargin)
      : entryPrice * (1 + 1 / leverage - maintenanceMargin)

    this.position = {
      type,
      amount,
      leverage,
      entryPrice,
      liqPrice,
      size: amount * leverage,
      openTime: Date.now(),
    }

    this.balance -= amount
    this._notify()
    return { success: true, position: this.position }
  }

  updatePnL(currentPrice) {
    if (!this.position) return null
    const { type, entryPrice, size } = this.position
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

    if (liquidated) {
      return this._closePosition(currentPrice, true)
    }

    this._notify()
    return null
  }

  closePosition(currentPrice) {
    if (!this.position) return null
    return this._closePosition(currentPrice, false)
  }

  _closePosition(currentPrice, liquidated) {
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
      duration: Date.now() - pos.openTime,
    }

    this.history.unshift(record)
    if (this.history.length > 20) this.history.pop()
    this.position = null
    this._notify()

    return { liquidated, pnl: record.pnl, record }
  }
}