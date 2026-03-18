import { Application } from 'pixi.js'
import { OceanScene } from './scenes/OceanScene.js'
import { ProfileModal } from './ui/ProfileModal.js'

console.log('1. Starting app...')

const app = new Application()

console.log('2. App created')



await app.init({
  resizeTo: document.getElementById('game-container'),
  backgroundColor: 0x020b18,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  preference: 'webgl', // ← forzar WebGL en lugar de WebGPU
})


console.log('3. App initialized')

document.getElementById('game-container').appendChild(app.canvas)

console.log('4. Canvas appended')

const ocean = new OceanScene(app)
await ocean.init()

console.log('5. Ocean initialized')

new ProfileModal()

app.ticker.add((ticker) => {
  ocean.update(ticker.deltaTime)
})

window.addEventListener('resize', () => {
  ocean.onResize()
})