import { Container, Graphics, Text } from 'pixi.js'

export class Whale {
  constructor(app, parent) {
    this.app = app
    this.container = new Container()
    parent.addChild(this.container)

    this.x = app.screen.width * 0.35
    this.y = app.screen.height * 0.5
    this.targetY = this.y
    this.time = 0
    this.tailTime = 0
    this.blinkTimer = 0
    this.blinkInterval = 180 + Math.random() * 120
    this.isBlinking = false
    this.blinkFrame = 0
    this.alive = true
    this.breatheTime = 0

    this.body = new Graphics()
    this.container.addChild(this.body)

    // Bitcoin label using Text
       this.btcLabel = new Text({
      text: '₿',
      style: {
        fontFamily: 'Arial Black, Arial',
        fontSize: 52,
        fontWeight: '900',
        fill: 0xf7931a,
      }
    })
    this.btcLabel.anchor.set(0.5)
    this.container.addChild(this.btcLabel)

    this._draw()
  }

  _draw() {
    const g = this.body
    g.clear()

    const t = this.tailTime
    const blink = this.isBlinking
    const breathe = Math.sin(this.breatheTime) * 2

    // ── TAIL ──
    const tailSwing = Math.sin(t * 2.0) * 18
    const tailX = -130

    // Left fluke
    g.moveTo(tailX + 30, breathe - 5)
    g.bezierCurveTo(
      tailX, breathe - 5 + tailSwing * 0.5,
      tailX - 30, breathe - 35 + tailSwing,
      tailX - 45, breathe - 28 + tailSwing
    )
    g.bezierCurveTo(
      tailX - 35, breathe - 10 + tailSwing * 0.6,
      tailX - 10, breathe + tailSwing * 0.2,
      tailX + 30, breathe + 5
    )
    g.fill({ color: 0x0d5c8f })

    // Right fluke
    g.moveTo(tailX + 30, breathe + 5)
    g.bezierCurveTo(
      tailX, breathe + 5 + tailSwing * 0.5,
      tailX - 30, breathe + 35 + tailSwing,
      tailX - 45, breathe + 28 + tailSwing
    )
    g.bezierCurveTo(
      tailX - 35, breathe + 10 + tailSwing * 0.6,
      tailX - 10, breathe + tailSwing * 0.2,
      tailX + 30, breathe - 5
    )
    g.fill({ color: 0x0d5c8f })

    // Tail connector
    g.moveTo(tailX + 30, breathe - 8)
    g.bezierCurveTo(tailX + 10, breathe - 6, tailX + 10, breathe + 6, tailX + 30, breathe + 8)
    g.fill({ color: 0x0d5c8f })

    // ── MAIN BODY — fat rounded whale ──
    // Bottom jaw / belly (lighter)
    g.moveTo(-120, breathe + 10)
    g.bezierCurveTo(-80, breathe + 65, 20, breathe + 72, 100, breathe + 42)
    g.bezierCurveTo(130, breathe + 28, 145, breathe + 12, 140, breathe + 2)
    g.bezierCurveTo(100, breathe + 20, 20, breathe + 58, -80, breathe + 50)
    g.bezierCurveTo(-100, breathe + 46, -115, breathe + 28, -120, breathe + 10)
    g.fill({ color: 0xd8eefa })

    // Main blue body
    g.moveTo(-120, breathe)
    g.bezierCurveTo(-100, breathe - 55, -20, breathe - 78, 60, breathe - 60)
    g.bezierCurveTo(110, breathe - 45, 145, breathe - 18, 140, breathe + 2)
    g.bezierCurveTo(130, breathe + 28, 90, breathe + 50, 20, breathe + 60)
    g.bezierCurveTo(-40, breathe + 68, -100, breathe + 52, -120, breathe + 10)
    g.bezierCurveTo(-128, breathe - 2, -126, breathe - 10, -120, breathe)
    g.fill({ color: 0x1a7ec8 })

    // Body top highlight
    g.moveTo(-90, breathe - 30)
    g.bezierCurveTo(-40, breathe - 68, 40, breathe - 70, 100, breathe - 44)
    g.bezierCurveTo(50, breathe - 62, -30, breathe - 60, -90, breathe - 30)
    g.fill({ color: 0x3aaee8, alpha: 0.45 })

    // ── DORSAL FIN ──
    const dorsalWave = Math.sin(t * 1.4) * 2.5
    g.moveTo(0, breathe - 58)
    g.bezierCurveTo(-15, breathe - 95 + dorsalWave, 20, breathe - 105 + dorsalWave, 45, breathe - 72)
    g.bezierCurveTo(35, breathe - 62, 15, breathe - 58, 0, breathe - 58)
    g.fill({ color: 0x0d5c8f })

    // ── PECTORAL FIN ──
    const finWave = Math.sin(t * 1.6) * 5
    g.moveTo(20, breathe + 30)
    g.bezierCurveTo(40, breathe + 55 + finWave, 80, breathe + 88 + finWave, 65, breathe + 98 + finWave)
    g.bezierCurveTo(45, breathe + 95 + finWave, 10, breathe + 68 + finWave, 5, breathe + 40)
    g.fill({ color: 0x0f6aaa })

    // ── HEAD / SNOUT ──
    g.moveTo(100, breathe - 40)
    g.bezierCurveTo(148, breathe - 30, 162, breathe - 8, 158, breathe + 10)
    g.bezierCurveTo(155, breathe + 24, 138, breathe + 34, 110, breathe + 38)
    g.bezierCurveTo(138, breathe + 20, 148, breathe + 8, 145, breathe - 5)
    g.bezierCurveTo(142, breathe - 22, 128, breathe - 34, 100, breathe - 40)
    g.fill({ color: 0x1a7ec8 })

    // ── MOUTH smile ──
    g.moveTo(145, breathe + 6)
    g.bezierCurveTo(150, breathe + 14, 146, breathe + 20, 136, breathe + 22)
    g.stroke({ color: 0x0a3d60, width: 2, cap: 'round', join: 'round' })
    g.fill({ color: 0x000000, alpha: 0 })

    // ── EYE ──
    const eyeX = 110
    const eyeY = breathe - 18
    g.circle(eyeX, eyeY, 11)
    g.fill({ color: 0xffffff })
    if (!blink) {
      g.circle(eyeX + 2, eyeY + 2, 7)
      g.fill({ color: 0x061a2a })
      g.circle(eyeX + 4.5, eyeY - 1, 2.5)
      g.fill({ color: 0xffffff })
      // Happy eye wrinkle
      g.moveTo(eyeX - 8, eyeY + 7)
      g.bezierCurveTo(eyeX, eyeY + 12, eyeX + 8, eyeY + 8, eyeX + 10, eyeY + 4)
      g.stroke({ color: 0x1a7ec8, width: 1.5 })
    } else {
      g.moveTo(eyeX - 7, eyeY)
      g.bezierCurveTo(eyeX, eyeY + 5, eyeX + 7, eyeY + 2, eyeX + 8, eyeY - 2)
      g.stroke({ color: 0x061a2a, width: 2.5, cap: 'round' })
    }

    // ── BLOWHOLE ──
    g.ellipse(30, breathe - 74, 8, 4)
    g.fill({ color: 0x0d5c8f })

    // Blow bubbles from blowhole when near surface
    g.circle(30, breathe - 82, 3)
    g.fill({ color: 0x88ddff, alpha: 0.4 })
    g.circle(24, breathe - 90, 2)
    g.fill({ color: 0x88ddff, alpha: 0.25 })

    // ── BELLY SPOTS (decorative) ──
    const spots = [
      { x: -30, y: breathe + 52, rx: 12, ry: 6 },
      { x: 20, y: breathe + 62, rx: 9, ry: 5 },
      { x: -70, y: breathe + 44, rx: 8, ry: 4 },
    ]
    spots.forEach(s => {
      g.ellipse(s.x, s.y, s.rx, s.ry)
      g.fill({ color: 0xffffff, alpha: 0.12 })
    })

    // Position BTC symbol on body
    this.btcLabel.x = 30
    this.btcLabel.y = breathe - 5
    this.btcLabel.style.fill = 0xffd700
    this.btcLabel.alpha = 0.85
  }

  setTargetY(y) {
    this.targetY = Math.max(90, Math.min(this.app.screen.height - 100, y))
  }

  update(delta) {
    if (!this.alive) return

    this.time += delta * 0.05
    this.tailTime += delta * 0.055
    this.breatheTime += delta * 0.022

    const dy = this.targetY - this.y
    this.y += dy * 0.038 * delta

    this.x = this.app.screen.width * 0.35 + Math.sin(this.time * 0.6) * 10

    const tilt = Math.max(-0.2, Math.min(0.2, dy * 0.0008))
    this.container.rotation = tilt
    this.container.x = this.x
    this.container.y = this.y

    // Blink
    this.blinkTimer++
    if (this.blinkTimer >= this.blinkInterval) {
      this.isBlinking = true
      this.blinkFrame++
      if (this.blinkFrame > 5) {
        this.isBlinking = false
        this.blinkFrame = 0
        this.blinkTimer = 0
        this.blinkInterval = 200 + Math.random() * 180
      }
    }

    this._draw()
  }

  die() {
    this.alive = false
  }
}