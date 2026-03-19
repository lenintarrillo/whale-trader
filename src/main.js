import * as PIXI from 'pixi.js'
import { OceanScene } from './scenes/OceanScene.js'
import { ProfileModal } from './ui/ProfileModal.js'
import { OrientationGuard } from './ui/OrientationGuard.js'
import { LoadingScreen } from './ui/LoadingScreen.js'
import { ModeSelector } from './ui/ModeSelector.js'

const loading = new LoadingScreen()

const app = new PIXI.Application({
  resizeTo: document.getElementById('game-container'),
  backgroundColor: 0x020b18,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
})

document.getElementById('game-container').appendChild(app.view)

const ocean = new OceanScene(app)
await ocean.init()

loading.hide()

// Mode selector
const selector = new ModeSelector()
const mode = await selector.show()

// Pass mode to ocean
ocean.setMode(mode)

new ProfileModal()
new OrientationGuard()

app.ticker.add((delta) => {
  ocean.update(delta)
})

window.addEventListener('resize', () => {
  ocean.onResize()
})