import { Container, Graphics } from 'pixi.js'
import { Bubbles } from '../entities/Bubbles.js'
import { Whale } from '../entities/Whale.js'
import { Spikes } from '../entities/Spikes.js'
import { MarketSim } from '../trading/MarketSim.js'
import { TradingEngine } from '../trading/TradingEngine.js'
import { TradingPanel } from '../ui/TradingPanel.js'
import { ResultScene } from './ResultScene.js'
import { ScreenFX } from '../fx/ScreenFX.js'
import { Particles } from '../fx/Particles.js'
import { PricePopup } from '../ui/PricePopup.js'
import { SeaFloor } from '../entities/SeaFloor.js'
import { SmallFish } from '../entities/SmallFish.js'
import { LevelLines } from '../ui/LevelLines.js'
import { Analytics } from '../analytics.js'



export class OceanScene {
  constructor(app) {
    this.app = app
    this.container = new Container()
    this.app.stage.addChild(this.container)
    this.time = 0
    this.currentPrice = 85000
    this.prevPrice = 85000
    this.minPrice = 75000
    this.maxPrice = 95000
  }

  async init() {
    this._drawBackground()
    this._drawLightRays()
   
    

    this.seaFloor = new SeaFloor(this.app, this.container)
    this.smallFish = new SmallFish(this.app, this.container)
    this.bubbles = new Bubbles(this.app, this.container)

     this._drawSurface()


        this.spikes = new Spikes(this.app, this.container)
    this.spikes.hide()

    this.whale = new Whale(this.app, this.container)
    await this.whale.load()

 

  // ← LevelLines en su propio container ENCIMA de todo
  this.overlayContainer = new Container()
  this.app.stage.addChild(this.overlayContainer)
  this.levelLines = new LevelLines(this.app, this.overlayContainer)

    console.log('overlayContainer children:', this.overlayContainer.children.length)




    this.resultScene = new ResultScene()
    this.screenFX = new ScreenFX(this.app)
    this.particles = new Particles(this.app, this.container)

    this.pricePopup = new PricePopup()



    this.engine = new TradingEngine(1000)
    this.engine.subscribe(state => this.panel.updateState(state))

    
    this.panel = new TradingPanel(
  (type, amount, leverage, stopLoss, takeProfit) => this._openPosition(type, amount, leverage, stopLoss, takeProfit),
  () => this._closePosition()
)

    this.panel.updateState(this.engine.getState())

    this.market = new MarketSim()
    this.market.subscribe(price => this._onPriceUpdate(price))
    this.market.start()
  }


  _openPosition(type, amount, leverage, stopLoss, takeProfit) {
      console.log('OceanScene received - SL:', stopLoss, 'TP:', takeProfit)
      Analytics.openPosition(type, leverage, amount)

  const result = this.engine.openPosition(type, amount, leverage, this.currentPrice, stopLoss, takeProfit)
  if (result.error) { alert(result.error); return }
  this.spikes.show(type, result.position.liqPrice)

    // Show level lines
  this.levelLines.show({
    liq: result.position.liqPrice,
    sl: stopLoss || null,
    tp: takeProfit || null,
    type,
  })

    console.log('LevelLines visible:', this.levelLines.visible)
  console.log('LevelLines levels:', this.levelLines.levels)


}

  async _closePosition() {
    const pos = this.engine.getState().position

    if (!pos) return
    const result = this.engine.closePosition(this.currentPrice)
    if (!result) return
    this.spikes.hide()
    this.levelLines.hide() 


    const state = this.engine.getState()
    const isWin = result.pnl >= 0
    const type = isWin ? 'win' : 'loss'

    if (isWin) {
      this.screenFX.flash(0x00ff88, 0.25, 500)
      this.particles.btcCoins(this.whale.x, this.whale.y)
      this.whale.celebrate()
          Analytics.closeWin(result.pnl, pos.leverage)

    } else {
      this.screenFX.flash(0xff6600, 0.3, 500)
      this.particles.bubbleBurst(this.whale.x, this.whale.y, 15)
      this.whale.mourn()
      Analytics.closeLoss(result.pnl, pos.leverage)

    }

    await new Promise(r => setTimeout(r, 300))

    const lastRecord = state.history[0]
    await this.resultScene.show(type, {
      posType: lastRecord?.type,
      leverage: lastRecord?.leverage,
      entryPrice: lastRecord?.entryPrice,
      closePrice: lastRecord?.closePrice,
      amount: lastRecord?.amount,
      pnl: lastRecord?.pnl,
      newBalance: state.balance,
    })

    // Reset whale pose after result screen
    this.whale.setPose('swim')
  }

  async _onLiquidation(result) {
    const state = this.engine.getState()
    this.screenFX.shake(16, 800)
    this.screenFX.flash(0xff0022, 0.6, 600)
    this.whale.die()
    this.levelLines.hide()
    this.particles.explode(this.whale.x, this.whale.y, {
      count: 60,
      colors: [0xff2244, 0xff6600, 0xff9900, 0xffcc00, 0xffffff],
      speed: 12,
      size: 6,
      gravity: 0.3,
      life: 100,
    })
    this.particles.bubbleBurst(this.whale.x, this.whale.y)

    Analytics.liquidated(state.history[0]?.leverage, state.history[0]?.amount)


    await new Promise(r => setTimeout(r, 400))

    const lastRecord = state.history[0]
    await this.resultScene.show('liquidated', {
      posType: lastRecord?.type,
      leverage: lastRecord?.leverage,
      entryPrice: lastRecord?.entryPrice,
      closePrice: lastRecord?.closePrice,
      amount: lastRecord?.amount,
      pnl: lastRecord?.pnl,
      newBalance: state.balance,
    })

    // Reset whale after result screen
    this.whale.alive = true
    this.whale.setPose('swim')
  }

  _onPriceUpdate(price) {
    this.prevPrice = this.currentPrice
    this.currentPrice = price

    const history = this.market.getHistory()
    if (history.length > 10) {
      const prices = history.map(h => h.price)
      this.minPrice = Math.min(...prices) * 0.998
      this.maxPrice = Math.max(...prices) * 1.002
    }

    const { height } = this.app.screen
    const margin = height * 0.12
    const range = this.maxPrice - this.minPrice
    const ratio = range > 0 ? (price - this.minPrice) / range : 0.5
    const targetY = margin + (1 - ratio) * (height - margin * 2)
    this.whale.setTargetY(targetY)

    this.panel.updatePrice(price, this.prevPrice)
    this.spikes.updatePrices(price, this.minPrice, this.maxPrice)
    this.levelLines.updatePrices(this.minPrice, this.maxPrice)

    const result = this.engine.updatePnL(price)
   if (result?.liquidated) {
  this.spikes.hide()
  this._onLiquidation(result)
} else if (result?.trigger === 'sl' || result?.trigger === 'tp') {
  this.spikes.hide()
  this._closeByTrigger(result)
}

    this.pricePopup.update(price, this.whale.x, this.whale.y)


  }


  async _closeByTrigger(result) {
  const state = this.engine.getState()
  const isWin = result.pnl >= 0

  if (result.trigger === 'tp') {
    this.screenFX.flash(0x00ff88, 0.25, 500)
    this.particles.btcCoins(this.whale.x, this.whale.y)
    this.whale.celebrate()
  } else {
    this.screenFX.flash(0xff6600, 0.3, 500)
    this.particles.bubbleBurst(this.whale.x, this.whale.y, 15)
    this.whale.mourn()
  }

  this.levelLines.hide()

  await new Promise(r => setTimeout(r, 300))

  const lastRecord = state.history[0]
  await this.resultScene.show(isWin ? 'win' : 'loss', {
    posType: lastRecord?.type,
    leverage: lastRecord?.leverage,
    entryPrice: lastRecord?.entryPrice,
    closePrice: lastRecord?.closePrice,
    amount: lastRecord?.amount,
    pnl: lastRecord?.pnl,
    newBalance: state.balance,
    trigger: result.trigger,
  })

  this.whale.setPose('swim')
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
    this.particles.update(delta)

    this.seaFloor.update(delta)
    this.smallFish.update(delta)
    this.levelLines.update(delta)




    const pos = this.engine.getState().position
    if (pos) {
      this.spikes.update(delta)
      this.panel.updateDangerBar(this.spikes.dangerRatio)
    }

    this.raysGraphic.x = -this.time * 8 % this.app.screen.width


  }

  onResize() {
    this.container.removeChildren()
    this._drawBackground()
    this._drawLightRays()
    this._drawSurface()
    this.bubbles = new Bubbles(this.app, this.container)
  }

  destroy() {
    this.market.stop()
    this.pricePopup.destroy()

  }
}