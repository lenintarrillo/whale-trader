import * as PIXI from 'pixi.js'

export class LevelLines {
  constructor(app, parent) {
    this.app = app
    this.parent = parent
    this.graphic = new PIXI.Graphics()
    parent.addChild(this.graphic)
    this.levels = {}
    this.minPrice = null
    this.maxPrice = null
    this.visible = false
    this.time = 0
  }

  show(levels) {
    this.levels = levels
    this.visible = true
    this._updateHTMLLabels()
  }

  hide() {
    this.visible = false
    this.graphic.clear()
    this.levels = {}
    document.querySelectorAll('.level-label').forEach(el => el.remove())
  }

  updatePrices(minPrice, maxPrice) {
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

  _updateHTMLLabels() {
    document.querySelectorAll('.level-label').forEach(el => el.remove())

    if (!document.getElementById('level-label-styles')) {
      const style = document.createElement('style')
      style.id = 'level-label-styles'
      style.textContent = `
        .level-label {
          position: fixed;
          left: 10px;
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          pointer-events: none;
          z-index: 500;
          white-space: nowrap;
          letter-spacing: 1px;
          transition: top 0.15s ease;
        }
        .level-liq { color: #ff4466; background: rgba(255,34,68,0.12); border: 1px solid rgba(255,34,68,0.3); }
        .level-sl  { color: #ff8866; background: rgba(255,119,68,0.12); border: 1px solid rgba(255,119,68,0.3); }
        .level-tp  { color: #00ffaa; background: rgba(0,255,170,0.12); border: 1px solid rgba(0,255,170,0.3); }
      `
      document.head.appendChild(style)
    }

    const configs = {
      liq: { cls: 'level-liq', text: '💀 LIQ' },
      sl:  { cls: 'level-sl',  text: '🛑 SL'  },
      tp:  { cls: 'level-tp',  text: '🎯 TP'  },
    }

    Object.entries(configs).forEach(([key, cfg]) => {
      if (!this.levels[key]) return
      const el = document.createElement('div')
      el.className = `level-label ${cfg.cls}`
      el.dataset.key = key
      el.textContent = `${cfg.text}  $${Math.round(this.levels[key]).toLocaleString('en-US')}`
      document.body.appendChild(el)
    })
  }

  _updateLabelPositions() {
    if (!this.visible || !this.minPrice) return
    document.querySelectorAll('.level-label').forEach(el => {
      const key = el.dataset.key
      if (!this.levels[key]) return
      const y = this._priceToY(this.levels[key])
      el.style.top = `${y - 9}px`
    })
  }

  update(delta) {
    if (!this.visible || !this.minPrice || !this.maxPrice) return

    this.time += delta * 0.05
    const { width } = this.app.screen
    const g = this.graphic
    g.clear()

    const lines = [
      { key: 'liq', color: 0xff2244, alpha: 0.5,  waveAmp: 3,   waveSpeed: 1.8, waveFreq: 0.018 },
      { key: 'sl',  color: 0xff7744, alpha: 0.45, waveAmp: 2.5, waveSpeed: 1.4, waveFreq: 0.015 },
      { key: 'tp',  color: 0x00ffaa, alpha: 0.45, waveAmp: 2.5, waveSpeed: 1.6, waveFreq: 0.016 },
    ]

    lines.forEach(({ key, color, alpha, waveAmp, waveSpeed, waveFreq }) => {
      if (!this.levels[key]) return

      const baseY = this._priceToY(this.levels[key])
      const segments = 80
      const segW = width / segments

      // Wavy line usando drawRect
      for (let i = 0; i < segments; i++) {
        const x = i * segW
        const wave1 = Math.sin(x * waveFreq + this.time * waveSpeed) * waveAmp
        const wave2 = Math.sin(x * waveFreq * 2.3 + this.time * waveSpeed * 0.7) * waveAmp * 0.4
        const y = baseY + wave1 + wave2
        const pulse = alpha + Math.sin(this.time * 2 + i * 0.1) * 0.08

        g.beginFill(color, pulse)
        g.drawRect(x, y - 0.8, segW + 0.5, 1.6)
        g.endFill()
      }

      // Glow band
      for (let i = 0; i < segments; i += 2) {
        const x = i * segW * 2
        const wave1 = Math.sin(x * waveFreq + this.time * waveSpeed) * waveAmp
        const wave2 = Math.sin(x * waveFreq * 2.3 + this.time * waveSpeed * 0.7) * waveAmp * 0.4
        const y = baseY + wave1 + wave2
        g.beginFill(color, 0.04)
        g.drawRect(x, y - 5, segW * 2, 10)
        g.endFill()
      }
    })

    this._updateLabelPositions()
  }
}