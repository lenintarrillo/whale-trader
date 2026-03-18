import * as PIXI from 'pixi.js'

export class Particles {
  constructor(app, parent) {
    this.app = app
    this.container = new PIXI.Container()
    parent.addChild(this.container)
    this.particles = []
  }

  explode(x, y, options = {}) {
    const {
      count = 40,
      colors = [0xff2244, 0xff6688, 0xff9900, 0xffcc00],
      speed = 8,
      size = 5,
      gravity = 0.25,
      life = 80,
    } = options

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const spd = speed * (0.5 + Math.random())
      const color = colors[Math.floor(Math.random() * colors.length)]
      const sz = size * (0.5 + Math.random())

      const g = new PIXI.Graphics()
      g.beginFill(color)
      g.drawCircle(0, 0, sz)
      g.endFill()
      g.x = x
      g.y = y

      this.container.addChild(g)
      this.particles.push({
        gfx: g,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        gravity,
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      })
    }
  }

  btcCoins(x, y, count = 30) {
    this.explode(x, y, {
      count,
      colors: [0xf7931a, 0xffcc44, 0xffe066, 0xffd700],
      speed: 10,
      size: 7,
      gravity: 0.3,
      life: 100,
    })
  }

  bubbleBurst(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
      const spd = 3 + Math.random() * 6
      const r = 3 + Math.random() * 6

      const g = new PIXI.Graphics()
      g.lineStyle(1, 0xaaeeff, 0.7)
      g.beginFill(0x88ddff, 0.3)
      g.drawCircle(0, 0, r)
      g.endFill()
      g.x = x
      g.y = y

      this.container.addChild(g)
      this.particles.push({
        gfx: g,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2,
        gravity: -0.05,
        life: 60 + Math.random() * 40,
        maxLife: 100,
        rotation: 0,
        rotSpeed: 0,
      })
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.vx *= 0.97
      p.vy += p.gravity * delta
      p.gfx.x += p.vx * delta
      p.gfx.y += p.vy * delta
      p.gfx.rotation += p.rotSpeed * delta
      p.life -= delta

      const lifeRatio = p.life / p.maxLife
      p.gfx.alpha = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1

      if (p.life <= 0) {
        this.container.removeChild(p.gfx)
        p.gfx.destroy()
        this.particles.splice(i, 1)
      }
    }
  }

  clear() {
    this.particles.forEach(p => {
      this.container.removeChild(p.gfx)
      p.gfx.destroy()
    })
    this.particles = []
  }
}