import * as PIXI from 'pixi.js'

export class SmallFish {
  constructor(app, parent) {
    this.app = app
    this.container = new PIXI.Container()
    parent.addChild(this.container)
    this.graphic = new PIXI.Graphics()
    this.container.addChild(this.graphic)
    this.fish = []
    this.time = 0
    this.spawnTimer = 0

    for (let i = 0; i < 6; i++) {
      this._spawn(true)
    }
  }

  _spawn(randomX = false) {
    const { width, height } = this.app.screen
    const goingRight = Math.random() > 0.5
    const colors = [0xff8844, 0xffaa22, 0xff6622, 0xffdd44, 0x44aaff, 0xff44aa]
    this.fish.push({
      x: randomX ? Math.random() * width : (goingRight ? -40 : width + 40),
      y: 100 + Math.random() * (height - 200),
      speed: (1.5 + Math.random() * 2.5) * (goingRight ? 1 : -1),
      size: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tailPhase: Math.random() * Math.PI * 2,
      tailSpeed: 0.15 + Math.random() * 0.1,
      wobble: Math.random() * Math.PI * 2,
      wobbleAmp: 0.3 + Math.random() * 0.5,
      goingRight,
    })
  }

  update(delta) {
    this.time += delta * 0.05
    this.spawnTimer += delta

    if (this.spawnTimer > 120 && this.fish.length < 10) {
      this._spawn(false)
      this.spawnTimer = 0
    }

    const { width, height } = this.app.screen
    const g = this.graphic
    g.clear()

    this.fish.forEach((f, idx) => {
      f.x += f.speed * delta * 0.5
      f.tailPhase += f.tailSpeed * delta
      f.wobble += 0.03 * delta
      f.y += Math.sin(f.wobble) * f.wobbleAmp

      if (f.x > width + 60 || f.x < -60) {
        this.fish.splice(idx, 1)
        return
      }

      const tail = Math.sin(f.tailPhase) * f.size * 0.6
      const flip = f.goingRight ? 1 : -1
      const x = f.x
      const y = f.y

      // Tail
      g.beginFill(f.color, 0.7)
      g.drawPolygon([
        x - 10 * flip, y,
        x - 18 * flip, y - f.size * 0.5 + tail,
        x - 18 * flip, y + f.size * 0.5 + tail,
      ])
      g.endFill()

      // Body
      g.beginFill(f.color, 0.85)
      g.drawEllipse(x, y, f.size * 1.4, f.size * 0.7)
      g.endFill()

      // Belly shine
      g.beginFill(0xffffff, 0.25)
      g.drawEllipse(x + 2 * flip, y + 1, f.size * 0.7, f.size * 0.35)
      g.endFill()

      // Eye
      g.beginFill(0x111111)
      g.drawCircle(x + f.size * 0.6 * flip, y - f.size * 0.1, f.size * 0.22)
      g.endFill()
      g.beginFill(0xffffff)
      g.drawCircle(x + f.size * 0.65 * flip, y - f.size * 0.12, f.size * 0.08)
      g.endFill()
    })
  }
}