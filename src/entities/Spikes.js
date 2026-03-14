import { Container, Graphics } from 'pixi.js'

export class Spikes {
  constructor(app, parent) {
    this.app = app
    this.container = new Container()
    parent.addChild(this.container)
    this.graphic = new Graphics()
    this.container.addChild(this.graphic)

    this.type = null
    this.liqPrice = null
    this.currentPrice = null
    this.minPrice = null
    this.maxPrice = null
    this.time = 0
    this.dangerRatio = 0
  }

  show(type, liqPrice) {
    this.type = type
    this.liqPrice = liqPrice
    this.container.visible = true
  }

  hide() {
    this.type = null
    this.container.visible = false
    this.graphic.clear()
  }

  updatePrices(currentPrice, minPrice, maxPrice) {
    this.currentPrice = currentPrice
    this.minPrice = minPrice
    this.maxPrice = maxPrice
  }

  _priceToY(price) {
    const { height } = this.app.screen
    const margin = height * 0.12
    const range = this.maxPrice - this.minPrice
    if (range === 0) return height * 0.5
    const ratio = (price - this.minPrice) / range
    return margin + (1 - ratio) * (height - margin * 2)
  }

  update(delta) {
    if (!this.type || !this.liqPrice || !this.currentPrice) return

    this.time += delta * 0.05
    const g = this.graphic
    g.clear()

    const { width, height } = this.app.screen
    const liqY = this._priceToY(this.liqPrice)
    const curY = this._priceToY(this.currentPrice)

    const dist = Math.abs(curY - liqY)
    const maxDist = height * 0.6
    this.dangerRatio = Math.max(0, Math.min(1, 1 - dist / maxDist))

    const pulse = 0.6 + Math.sin(this.time * 4) * 0.4 * this.dangerRatio
    const glowAlpha = 0.15 + this.dangerRatio * 0.35
    const spikeColor = 0xff2244
    const glowColor = 0xff0033

    const spikeCount = 18
    const spikeSpacing = width / spikeCount
    const spikeHeight = 45 + this.dangerRatio * 25

    if (this.type === 'long') {
      g.rect(0, liqY, width, height - liqY)
      g.fill({ color: glowColor, alpha: glowAlpha * pulse })

      g.moveTo(0, liqY)
      g.lineTo(width, liqY)
      g.stroke({ color: 0xff4466, alpha: 0.6 + pulse * 0.4, width: 1.5 })

      for (let i = 0; i < spikeCount; i++) {
        const sx = i * spikeSpacing
        const wobble = Math.sin(this.time * 3 + i * 0.7) * 3 * this.dangerRatio
        g.poly([
          sx, liqY + 8,
          sx + spikeSpacing * 0.5, liqY - spikeHeight + wobble,
          sx + spikeSpacing, liqY + 8,
        ])
        g.fill({ color: spikeColor, alpha: 0.75 + pulse * 0.25 })

        g.poly([
          sx + spikeSpacing * 0.45, liqY - spikeHeight * 0.7 + wobble,
          sx + spikeSpacing * 0.5, liqY - spikeHeight + wobble,
          sx + spikeSpacing * 0.55, liqY - spikeHeight * 0.7 + wobble,
        ])
        g.fill({ color: 0xff8899, alpha: 0.5 })
      }

    } else {
      g.rect(0, 0, width, liqY)
      g.fill({ color: glowColor, alpha: glowAlpha * pulse })

      g.moveTo(0, liqY)
      g.lineTo(width, liqY)
      g.stroke({ color: 0xff4466, alpha: 0.6 + pulse * 0.4, width: 1.5 })

      for (let i = 0; i < spikeCount; i++) {
        const sx = i * spikeSpacing
        const wobble = Math.sin(this.time * 3 + i * 0.7) * 3 * this.dangerRatio
        g.poly([
          sx, liqY - 8,
          sx + spikeSpacing * 0.5, liqY + spikeHeight - wobble,
          sx + spikeSpacing, liqY - 8,
        ])
        g.fill({ color: spikeColor, alpha: 0.75 + pulse * 0.25 })

        g.poly([
          sx + spikeSpacing * 0.45, liqY + spikeHeight * 0.7 - wobble,
          sx + spikeSpacing * 0.5, liqY + spikeHeight - wobble,
          sx + spikeSpacing * 0.55, liqY + spikeHeight * 0.7 - wobble,
        ])
        g.fill({ color: 0xff8899, alpha: 0.5 })
      }
    }
  }
}