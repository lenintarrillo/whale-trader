import { Application } from 'pixi.js'
import { OceanScene } from './scenes/OceanScene.js'
import { IntroScene } from './scenes/IntroScene.js'

const app = new Application()

await app.init({
  resizeTo: document.getElementById('game-container'),
  backgroundColor: 0x020b18,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
})

document.getElementById('game-container').appendChild(app.canvas)

// Show intro first
const intro = new IntroScene()
await intro.show()

// Then load ocean
const ocean = new OceanScene(app)
await ocean.init()

app.ticker.add((ticker) => {
  ocean.update(ticker.deltaTime)
})

window.addEventListener('resize', () => {
  ocean.onResize()
})