export class MarketSim {
  constructor() {
    this.price = 85000
    this.prevPrice = 85000
    this.subscribers = []
    this.history = []
    this.maxHistory = 200
    this.ws = null
    this.reconnectTimer = null
    this.isConnected = false
  }

  start() {
    this._connect()
  }

  stop() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
  }

  subscribe(fn) {
    this.subscribers.push(fn)
  }

  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter(s => s !== fn)
  }

  getPrice() {
    return this.price
  }

  getHistory() {
    return [...this.history]
  }

  _connect() {
    console.log('🔌 Conectando a Binance WebSocket...')

    this.ws = new WebSocket('wss://stream.binance.com/ws/btcusdt@trade')

    this.ws.onopen = () => {
      console.log('✅ Binance WebSocket conectado')
      this.isConnected = true
    }

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const price = parseFloat(data.p)
      if (!price || isNaN(price)) return

      this.prevPrice = this.price
      this.price = price

      this.history.push({
        price: this.price,
        time: Date.now()
      })
      if (this.history.length > this.maxHistory) this.history.shift()

      this.subscribers.forEach(fn => fn(this.price))
    }

    this.ws.onerror = (e) => {
      console.warn('⚠️ Binance WebSocket error, usando fallback simulado')
      this._startFallback()
    }

    this.ws.onclose = () => {
      console.warn('🔄 WebSocket cerrado, reconectando en 3s...')
      this.isConnected = false
      this.reconnectTimer = setTimeout(() => this._connect(), 3000)
    }
  }

  // Fallback simulado si Binance no está disponible
  _startFallback() {
    if (this.ws) { this.ws.onclose = null; this.ws.close() }
    console.log('🎲 Usando simulador de precio como fallback')

    this.basePrice = this.price || 85000
    this.trend = 0
    this.trendTimer = 0
    this.trendDuration = 100 + Math.random() * 200
    this.volatility = 0.0012

    this._fallbackInterval = setInterval(() => {
      this.trendTimer++
      if (this.trendTimer >= this.trendDuration) {
        this.trend = (Math.random() - 0.5) * 0.0008
        this.trendDuration = 80 + Math.random() * 250
        this.trendTimer = 0
      }
      const shock = (Math.random() - 0.5) * 2
      const change = this.price * (this.volatility * shock + this.trend)
      const reversion = (this.basePrice - this.price) * 0.0003
      this.price = Math.max(10000, this.price + change + reversion)

      this.history.push({ price: this.price, time: Date.now() })
      if (this.history.length > this.maxHistory) this.history.shift()
      this.subscribers.forEach(fn => fn(this.price))
    }, 500)
  }
}