import * as PIXI from 'pixi.js'

export class Whale {
  constructor(app, parent) {
    this.app = app
    this.container = new PIXI.Container()
    parent.addChild(this.container)

    this.x = app.screen.width * 0.35
    this.y = app.screen.height * 0.5
    this.targetY = this.y
    this.time = 0
    this.blinkTimer = 0
    this.blinkInterval = 200 + Math.random() * 150
    this.alive = true

    this.sprites = {}
    this.currentSprite = null
    this.currentPose = null
  }

  async load() {
    const poses = {
      swim:  '/whale_swim.png',
      swim2: '/whale_swim2.png',
      swim3: '/whale_swim3.png',
      up:    '/whale_up.png',
      down:  '/whale_down.png',
      happy: '/whale_happy.png',
      sad:   '/whale_sad.png',
      dead:  '/whale_dead.png',
      blink: '/whale_blink.png',
    }

    for (const [key, path] of Object.entries(poses)) {
      const texture = await PIXI.Assets.load(path)
      const sprite = new PIXI.Sprite(texture)
      sprite.anchor.set(0.5)
      sprite.visible = false
      this.container.addChild(sprite)
      this.sprites[key] = sprite
    }

    this._setPose('swim')

    // Tamaño de la ballena
const baseScale = this.app.screen.width < 768 ? 0.35 : 0.55
this.container.scale.set(baseScale)
this.baseScale = baseScale

  }

  _setPose(name) {
    if (this.currentPose === name) return
    if (this.currentSprite) this.currentSprite.visible = false
    if (!this.sprites[name]) return
    this.currentSprite = this.sprites[name]
    this.currentSprite.visible = true
    this.currentPose = name
  }

  _getSwimPose(dy) {
    const frame = Math.floor(this.time * 2) % 3
    const swimFrames = ['swim', 'swim2', 'swim3']
    if (dy < -3) return 'up'
    if (dy > 3) return 'down'
    return swimFrames[frame]
  }

  setTargetY(y) {
    this.targetY = Math.max(100, Math.min(this.app.screen.height - 110, y))
  }

  setPose(name) {
    this._setPose(name)
  }

  update(delta) {
    if (!this.alive) return

    this.time += delta * 0.05

    const dy = this.targetY - this.y
    this.y += dy * 0.038 * delta
    this.x = this.app.screen.width * 0.35 + Math.sin(this.time * 0.6) * 10

    const tilt = Math.max(-0.25, Math.min(0.25, dy * 0.001))
    this.container.rotation = tilt

    const breatheScale = this.baseScale + Math.sin(this.time * 1.4) * 0.008
    this.container.scale.set(breatheScale)

    this.container.x = this.x
    this.container.y = this.y

    this._setPose(this._getSwimPose(dy))

    this.blinkTimer++
    if (this.blinkTimer >= this.blinkInterval) {
      this._setPose('blink')
      setTimeout(() => {
        if (this.alive) this._setPose('swim')
      }, 180)
      this.blinkTimer = 0
      this.blinkInterval = 200 + Math.random() * 180
    }
  }

  die() {
    this.alive = false
    this._setPose('dead')
  }

  celebrate() {
    this._setPose('happy')
  }

  mourn() {
    this._setPose('sad')
  }
}