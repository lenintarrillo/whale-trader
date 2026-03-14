export class ScreenFX {
  constructor(app) {
    this.app = app
    this.shaking = false
    this.shakeIntensity = 0
    this.originalX = 0
    this.originalY = 0
  }

  shake(intensity = 12, duration = 600) {
    this.shaking = true
    this.shakeIntensity = intensity
    const start = Date.now()
    const loop = () => {
      const elapsed = Date.now() - start
      const progress = elapsed / duration
      if (progress >= 1) {
        this.app.stage.x = 0
        this.app.stage.y = 0
        this.shaking = false
        return
      }
      const decay = 1 - progress
      this.app.stage.x = (Math.random() - 0.5) * this.shakeIntensity * decay
      this.app.stage.y = (Math.random() - 0.5) * this.shakeIntensity * decay
      requestAnimationFrame(loop)
    }
    loop()
  }

  flash(color = 0xff0022, alpha = 0.6, duration = 800) {
    const { Graphics } = window.__PIXI__ || {}
    return new Promise(resolve => {
      const el = document.createElement('div')
      el.style.cssText = `
        position:fixed;inset:0;z-index:9999;pointer-events:none;
        background:${this._hexToRgba(color, alpha)};
        transition:opacity ${duration}ms ease-out;
        opacity:1;
      `
      document.body.appendChild(el)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '0'
          setTimeout(() => { el.remove(); resolve() }, duration)
        })
      })
    })
  }

  _hexToRgba(hex, alpha) {
    const r = (hex >> 16) & 255
    const g = (hex >> 8) & 255
    const b = hex & 255
    return `rgba(${r},${g},${b},${alpha})`
  }
}