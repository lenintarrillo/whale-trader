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

    // Pre-generate stalactite shapes for consistency
    this.stalaData = this._generateStalactites()
  }

  _generateStalactites() {
  const count = 26
  return Array.from({ length: count }, (_, i) => ({
    offset: i / (count - 1),
    width: 45 + Math.random() * 35,
    height: 55 + Math.random() * 70,
    tipSharp: 0.15 + Math.random() * 0.2,
    midBulge: 0.4 + Math.random() * 0.2,
    colorVar: Math.random(),
    drip: Math.random() > 0.6,
    dripSize: 3 + Math.random() * 5,
    dripOffset: 0.3 + Math.random() * 0.4,
    ridges: Math.floor(Math.random() * 3),
    ridgeOffsets: [
      0.3 + Math.random() * 0.2,
      0.5 + Math.random() * 0.2,
      0.7 + Math.random() * 0.15,
    ],
  }))
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
    const mid = (this.minPrice + this.maxPrice) / 2
    const spread = Math.max(this.maxPrice - this.minPrice, mid * 0.05)
    const expandedMin = mid - spread * 3
    const expandedMax = mid + spread * 3
    const range = expandedMax - expandedMin
    if (range === 0) return height * 0.5
    const ratio = (price - expandedMin) / range
    const y = margin + (1 - ratio) * (height - margin * 2)
    return Math.max(margin, Math.min(height - margin, y))
  }

  update(delta) {
    if (!this.type || !this.liqPrice || !this.currentPrice) return

    this.time += delta * 0.04
    const g = this.graphic
    g.clear()

    const { width, height } = this.app.screen
    const liqY = this._priceToY(this.liqPrice)
    const curY = this._priceToY(this.currentPrice)

    const dist = Math.abs(curY - liqY)
    const maxDist = height * 0.6
    this.dangerRatio = Math.max(0, Math.min(1, 1 - dist / maxDist))

    const pulse = 0.5 + Math.sin(this.time * 3) * 0.5 * this.dangerRatio

    if (this.type === 'long') {
      this._drawStalactitesFloor(g, liqY, width, height, pulse)
    } else {
      this._drawStalactitesCeiling(g, liqY, width, pulse)
    }
  }

  _drawStalactitesFloor(g, liqY, width, height, pulse) {
    // Rock base — full floor from liqY down
    g.rect(0, liqY, width, height - liqY)
    g.fill({ color: 0x0a1a10, alpha: 0.75 })

    // Rock texture layers
    g.rect(0, liqY, width, 8)
    g.fill({ color: 0x0f2a18, alpha: 0.9 })
    g.rect(0, liqY + 3, width, 3)
    g.fill({ color: 0x1a3a22, alpha: 0.5 })

    // Danger glow on base
    if (this.dangerRatio > 0.2) {
      g.rect(0, liqY, width, 12)
      g.fill({ color: 0xff2244, alpha: 0.06 + pulse * 0.08 })
    }

    // Draw each stalactite pointing UP
    this.stalaData.forEach((s, i) => {
      const cx = s.offset * width + Math.sin(this.time * 0.3 + i * 0.7) * 1.5
      const baseY = liqY

      
      //const tipY = liqY - s.height * (0.85 + this.dangerRatio * 0.15)
      const tipY = liqY - s.height


      const hw = s.width / 2

      // Color variation — dark mossy rock
      const baseColor = s.colorVar > 0.6 ? 0x1a3a20 : s.colorVar > 0.3 ? 0x142e18 : 0x0f2214
      const midColor = s.colorVar > 0.6 ? 0x224a28 : s.colorVar > 0.3 ? 0x1c3e20 : 0x152a18
      const tipColor = 0x0a1810

      // Shadow behind stalactite
      g.poly([
        cx - hw * 0.9 + 3, baseY,
        cx + hw * 0.9 + 3, baseY,
        cx + s.tipSharp * hw * 0.5 + 3, tipY + 4,
        cx + 3, tipY + 2,
      ])
      g.fill({ color: 0x000000, alpha: 0.3 })

      // Main stalactite body
      g.poly([
        cx - hw, baseY,
        cx + hw, baseY,
        cx + s.tipSharp * hw, tipY + s.height * 0.15,
        cx, tipY,
        cx - s.tipSharp * hw, tipY + s.height * 0.15,
      ])
      g.fill({ color: baseColor })

      // Mid highlight bulge
      g.poly([
        cx - hw * s.midBulge, baseY,
        cx + hw * s.midBulge, baseY,
        cx + s.tipSharp * hw * 0.6, tipY + s.height * 0.2,
        cx, tipY + s.height * 0.05,
        cx - s.tipSharp * hw * 0.6, tipY + s.height * 0.2,
      ])
      g.fill({ color: midColor, alpha: 0.7 })

      // Left shine streak
      g.poly([
        cx - hw * 0.55, baseY,
        cx - hw * 0.35, baseY,
        cx - s.tipSharp * hw * 0.2, tipY + s.height * 0.25,
        cx - s.tipSharp * hw * 0.4, tipY + s.height * 0.25,
      ])
      g.fill({ color: 0x2a5a30, alpha: 0.45 })

      // Ridges / horizontal bands
      s.ridgeOffsets.slice(0, s.ridges).forEach(ro => {
        const ry = tipY + (baseY - tipY) * ro
        const rw = hw * (ro + 0.1) * 0.9
        g.rect(cx - rw, ry - 1, rw * 2, 2)
        g.fill({ color: 0x0a1810, alpha: 0.5 })
      })

      // Tip — darker sharp point
      g.poly([
        cx - s.tipSharp * hw * 0.8, tipY + s.height * 0.12,
        cx + s.tipSharp * hw * 0.8, tipY + s.height * 0.12,
        cx, tipY,
      ])
      g.fill({ color: tipColor })

      // Tip glint
      g.poly([
        cx - 1.5, tipY + 4,
        cx + 0.5, tipY + 4,
        cx, tipY,
      ])
      g.fill({ color: 0x3a6a40, alpha: 0.6 })

      // Water drip
      if (s.drip) {
        const dripY = tipY + (baseY - tipY) * s.dripOffset
        const dripPulse = Math.abs(Math.sin(this.time * 0.8 + i * 0.5))
        g.circle(cx + 1, dripY, s.dripSize * dripPulse * 0.6)
        g.fill({ color: 0x44aacc, alpha: 0.35 * dripPulse })
        // Drip streak
        g.rect(cx, dripY - s.height * 0.12, 1.5, s.height * 0.1)
        g.fill({ color: 0x44aacc, alpha: 0.15 })
      }

      // Danger glow on tip
      if (this.dangerRatio > 0.3) {
        g.circle(cx, tipY + 2, 4 + pulse * 3)
        g.fill({ color: 0xff2244, alpha: 0.12 + pulse * 0.15 })
      }
    })

    // Moss patches on base
    for (let i = 0; i < 8; i++) {
      const mx = (i / 8) * width + Math.sin(i * 1.3) * 30
      g.ellipse(mx, liqY + 5, 18 + Math.sin(i) * 8, 4)
      g.fill({ color: 0x1a4a20, alpha: 0.5 })
    }
  }

  _drawStalactitesCeiling(g, liqY, width, pulse) {
    // Rock base ceiling
    g.rect(0, 0, width, liqY)
    g.fill({ color: 0x0a1a10, alpha: 0.75 })

    g.rect(0, liqY - 8, width, 8)
    g.fill({ color: 0x0f2a18, alpha: 0.9 })
    g.rect(0, liqY - 6, width, 3)
    g.fill({ color: 0x1a3a22, alpha: 0.5 })

    if (this.dangerRatio > 0.2) {
      g.rect(0, liqY - 12, width, 12)
      g.fill({ color: 0xff2244, alpha: 0.06 + pulse * 0.08 })
    }

    // Draw each stalactite pointing DOWN
    this.stalaData.forEach((s, i) => {
      const cx = s.offset * width + Math.sin(this.time * 0.3 + i * 0.7) * 1.5
      const baseY = liqY

      //const tipY = liqY + s.height * (0.85 + this.dangerRatio * 0.15)
        const tipY = liqY + s.height

      const hw = s.width / 2

      const baseColor = s.colorVar > 0.6 ? 0x1a3a20 : s.colorVar > 0.3 ? 0x142e18 : 0x0f2214
      const midColor = s.colorVar > 0.6 ? 0x224a28 : s.colorVar > 0.3 ? 0x1c3e20 : 0x152a18
      const tipColor = 0x0a1810

      // Shadow
      g.poly([
        cx - hw * 0.9 + 3, baseY,
        cx + hw * 0.9 + 3, baseY,
        cx + s.tipSharp * hw * 0.5 + 3, tipY - 4,
        cx + 3, tipY - 2,
      ])
      g.fill({ color: 0x000000, alpha: 0.3 })

      // Main body
      g.poly([
        cx - hw, baseY,
        cx + hw, baseY,
        cx + s.tipSharp * hw, tipY - s.height * 0.15,
        cx, tipY,
        cx - s.tipSharp * hw, tipY - s.height * 0.15,
      ])
      g.fill({ color: baseColor })

      // Mid highlight
      g.poly([
        cx - hw * s.midBulge, baseY,
        cx + hw * s.midBulge, baseY,
        cx + s.tipSharp * hw * 0.6, tipY - s.height * 0.2,
        cx, tipY - s.height * 0.05,
        cx - s.tipSharp * hw * 0.6, tipY - s.height * 0.2,
      ])
      g.fill({ color: midColor, alpha: 0.7 })

      // Left shine
      g.poly([
        cx - hw * 0.55, baseY,
        cx - hw * 0.35, baseY,
        cx - s.tipSharp * hw * 0.2, tipY - s.height * 0.25,
        cx - s.tipSharp * hw * 0.4, tipY - s.height * 0.25,
      ])
      g.fill({ color: 0x2a5a30, alpha: 0.45 })

      // Ridges
      s.ridgeOffsets.slice(0, s.ridges).forEach(ro => {
        const ry = baseY + (tipY - baseY) * ro
        const rw = hw * (ro + 0.1) * 0.9
        g.rect(cx - rw, ry - 1, rw * 2, 2)
        g.fill({ color: 0x0a1810, alpha: 0.5 })
      })

      // Tip
      g.poly([
        cx - s.tipSharp * hw * 0.8, tipY - s.height * 0.12,
        cx + s.tipSharp * hw * 0.8, tipY - s.height * 0.12,
        cx, tipY,
      ])
      g.fill({ color: tipColor })

      // Tip glint
      g.poly([
        cx - 1.5, tipY - 4,
        cx + 0.5, tipY - 4,
        cx, tipY,
      ])
      g.fill({ color: 0x3a6a40, alpha: 0.6 })

      // Water drip downward
      if (s.drip) {
        const dripY = baseY + (tipY - baseY) * s.dripOffset
        const dripPulse = Math.abs(Math.sin(this.time * 0.8 + i * 0.5))
        g.circle(cx + 1, dripY, s.dripSize * dripPulse * 0.6)
        g.fill({ color: 0x44aacc, alpha: 0.35 * dripPulse })
        g.rect(cx, dripY, 1.5, s.height * 0.1)
        g.fill({ color: 0x44aacc, alpha: 0.15 })
      }

      // Danger glow
      if (this.dangerRatio > 0.3) {
        g.circle(cx, tipY - 2, 4 + pulse * 3)
        g.fill({ color: 0xff2244, alpha: 0.12 + pulse * 0.15 })
      }
    })

    // Moss patches
    for (let i = 0; i < 8; i++) {
      const mx = (i / 8) * width + Math.sin(i * 1.3) * 30
      g.ellipse(mx, liqY - 5, 18 + Math.sin(i) * 8, 4)
      g.fill({ color: 0x1a4a20, alpha: 0.5 })
    }
  }
}