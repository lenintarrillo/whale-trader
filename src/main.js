import * as PIXI from 'pixi.js'
import { OceanScene } from './scenes/OceanScene.js'
import { ProfileModal } from './ui/ProfileModal.js'
import { OrientationGuard } from './ui/OrientationGuard.js'
import { LoadingScreen } from './ui/LoadingScreen.js'

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

new ProfileModal()
new OrientationGuard()

app.ticker.add((delta) => {
  ocean.update(delta)
})

window.addEventListener('resize', () => {
  ocean.onResize()
})