import { Container, Graphics } from 'pixi.js'
import { Bubbles } from '../entities/Bubbles.js'
import { Whale } from '../entities/Whale.js'
import { MarketSim } from '../trading/MarketSim.js'

export class OceanScene {
  constructor(app) {
    this.app = app
    this.container = new Container()
    this.app.stage.addChild(this.container)
    this.time = 0
    this.currentPrice = 85000
    this.minPrice = 75000
    this.maxPrice = 95000
  }

  async init() {
    this._drawBackground()
    this._drawLightRays()
    this._drawSurface()
    this.bubbles = new Bubbles(this.app, this.container)
    this.whale = new Whale(this.app, this.container)

    // Start market
    this.market = new MarketSim()
    this.market.subscribe((price) => this._onPriceUpdate(price))
    this.market.start()
  }

  _onPriceUpdate(price) {
    this.currentPrice = price

    // Update price range dynamically
    const history = this.market.getHistory()
    if (history.length > 10) {
      const prices = history.map(h => h.price)
      this.minPrice = Math.min(...prices) * 0.998
      this.maxPrice = Math.max(...prices) * 1.002
    }

    // Map price to Y position on screen
    const { height } = this.app.screen
    const margin = height * 0.12
    const range = this.maxPrice - this.minPrice
    const ratio = range > 0
      ? (price - this.minPrice) / range
      : 0.5

    // Higher price = higher on screen = lower Y value
    const targetY = margin + (1 - ratio) * (height - margin * 2)
    this.whale.setTargetY(targetY)
  }

  _drawBackground() {
    const { width, height } = this.app.screen
    const bg = new Graphics()
    bg.rect(0, 0, width, height * 0.15).fill(0x020b18)
    bg.rect(0, height * 0.15, width, height * 0.25).fill(0x031525)
    bg.rect(0, height * 0.40, width, height * 0.30).fill(0x041d30)
    bg.rect(0, height * 0.70, width, height * 0.30).fill(0x020f1c)
    this.container.addChild(bg)
  }

  _drawLightRays() {
    this.raysGraphic = new Graphics()
    this.container.addChild(this.raysGraphic)
    this._updateRays(0)
  }

  _updateRays(time) {
    const { width, height } = this.app.screen
    const g = this.raysGraphic
    g.clear()
    const rays = [
      { x: width * 0.2, angle: 0.15, w: 80 },
      { x: width * 0.45, angle: -0.08, w: 120 },
      { x: width * 0.7, angle: 0.12, w: 60 },
      { x: width * 0.85, angle: -0.05, w: 90 },
    ]
    rays.forEach((ray, i) => {
      const pulse = 0.04 + Math.sin(time * 0.4 + i * 1.3) * 0.025
      const topW = ray.w * 0.3
      const botW = ray.w * (1 + Math.sin(time * 0.3 + i) * 0.1)
      const offsetX = Math.sin(time * 0.2 + i * 0.8) * 20
      const x = ray.x + offsetX
      const len = height * 0.75
      g.poly([
        x - topW / 2, 0,
        x + topW / 2, 0,
        x + botW / 2 + ray.angle * len, len,
        x - botW / 2 + ray.angle * len, len,
      ])
      g.fill({ color: 0x1a6fa8, alpha: pulse })
    })
  }

  _drawSurface() {
    this.surfaceGraphic = new Graphics()
    this.container.addChild(this.surfaceGraphic)
    this._updateSurface(0)
  }

  _updateSurface(time) {
    const { width } = this.app.screen
    const g = this.surfaceGraphic
    g.clear()
    const points = []
    const segments = 60
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width
      const y = 60
        + Math.sin(x * 0.015 + time * 0.8) * 6
        + Math.sin(x * 0.03 + time * 1.2) * 3
        + Math.sin(x * 0.008 + time * 0.5) * 4
      points.push(x, y)
    }
    g.poly([0, 0, ...points, width, 0])
    g.fill({ color: 0x0a3a5a, alpha: 0.6 })
    for (let i = 0; i < points.length - 2; i += 2) {
      const shimmer = 0.3 + Math.sin(time * 2 + i * 0.1) * 0.2
      g.moveTo(points[i], points[i + 1])
      g.lineTo(points[i + 2], points[i + 3])
      g.stroke({ color: 0x4dd8ff, alpha: shimmer, width: 1.5 })
    }
    for (let i = 0; i < 12; i++) {
      const px = (i / 12) * width + Math.sin(time * 0.5 + i) * 30
      const py = 60 + Math.sin(px * 0.015 + time * 0.8) * 6 - 2
      const r = 1.5 + Math.sin(time + i * 0.7) * 0.8
      g.circle(px, py, r)
      g.fill({ color: 0xaaeeff, alpha: 0.5 })
    }
  }

  update(delta) {
    this.time += delta * 0.05
    this._updateRays(this.time)
    this._updateSurface(this.time)
    this.bubbles.update(delta)
    this.whale.update(delta)
  }

  onResize() {
    this.container.removeChildren()
    this._drawBackground()
    this._drawLightRays()
    this._drawSurface()
    this.bubbles = new Bubbles(this.app, this.container)
    this.whale = new Whale(this.app, this.container)
  }

  destroy() {
    this.market.stop()
  }
}