import * as PIXI from 'pixi.js'
import { OceanScene } from './scenes/OceanScene.js'
import { ProfileModal } from './ui/ProfileModal.js'

console.log('1. Starting app...')

const app = new PIXI.Application({
  resizeTo: document.getElementById('game-container'),
  backgroundColor: 0x020b18,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
})

console.log('2. App initialized - renderer:', app.renderer.type)

document.getElementById('game-container').appendChild(app.view)

console.log('3. Canvas appended')

const ocean = new OceanScene(app)
await ocean.init()

console.log('4. Ocean initialized')

new ProfileModal()

app.ticker.add((delta) => {
  ocean.update(delta)
})

window.addEventListener('resize', () => {
  ocean.onResize()
})