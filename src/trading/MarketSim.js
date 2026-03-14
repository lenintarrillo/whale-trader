export class MarketSim {
  constructor() {
    this.price = 85000
    this.basePrice = 85000
    this.volatility = 0.0012
    this.trend = 0
    this.trendTimer = 0
    this.trendDuration = 100 + Math.random() * 200
    this.subscribers = []
    this.history = []
    this.maxHistory = 200
    this.tickInterval = null
  }

  start() {
    this.tickInterval = setInterval(() => this._tick(), 500)
  }

  stop() {
    if (this.tickInterval) clearInterval(this.tickInterval)
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

  _tick() {
    // Change trend occasionally
    this.trendTimer++
    if (this.trendTimer >= this.trendDuration) {
      this.trend = (Math.random() - 0.5) * 0.0008
      this.trendDuration = 80 + Math.random() * 250
      this.trendTimer = 0
    }

    // Brownian motion + trend
    const shock = (Math.random() - 0.5) * 2
    const change = this.price * (this.volatility * shock + this.trend)

    // Mean reversion so price doesn't drift to infinity
    const reversion = (this.basePrice - this.price) * 0.0003
    this.price = Math.max(10000, this.price + change + reversion)

    // Store history
    this.history.push({
      price: this.price,
      time: Date.now()
    })
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    // Notify all subscribers
    this.subscribers.forEach(fn => fn(this.price))
  }
}