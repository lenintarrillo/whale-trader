import * as PIXI from 'pixi.js'

export class Bubbles {
  constructor(app, parent) {
    this.app = app
    this.container = new PIXI.Container()
    parent.addChild(this.container)
    this.bubbles = []

    for (let i = 0; i < 28; i++) {
      this._spawn(true)
    }
  }

  _spawn(randomY = false) {
    const { width, height } = this.app.screen
    const g = new PIXI.Graphics()
    const r = 2 + Math.random() * 5

    g.lineStyle(0.8, 0xaaeeff, 0.4 + Math.random() * 0.3)
    g.beginFill(0x88ddff, 0)
    g.drawCircle(0, 0, r)
    g.endFill()

    g.x = Math.random() * width
    g.y = randomY ? Math.random() * height : height + r * 2

    const bubble = {
      gfx: g,
      r,
      speed: 0.3 + Math.random() * 0.8,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobbleAmp: 0.5 + Math.random() * 1.5,
      baseX: g.x,
      alpha: 0.3 + Math.random() * 0.5,
      life: 0,
      maxLife: 120 + Math.random() * 200,
    }

    this.container.addChild(g)
    this.bubbles.push(bubble)
  }

  update(delta) {
    const { width, height } = this.app.screen

    this.bubbles.forEach((b, idx) => {
      b.life += delta
      b.wobble += b.wobbleSpeed * delta
      b.gfx.y -= b.speed * delta
      b.gfx.x = b.baseX + Math.sin(b.wobble) * b.wobbleAmp

      const lifeRatio = b.life / b.maxLife
      let alpha = b.alpha
      if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1
      if (lifeRatio > 0.8) alpha *= (1 - lifeRatio) / 0.2
      b.gfx.alpha = alpha

      if (b.gfx.y < 55 || b.life >= b.maxLife) {
        this.container.removeChild(b.gfx)
        this.bubbles.splice(idx, 1)
        this._spawn(false)
      }
    })
  }
}