export class IntroScene {
  constructor() {
    this.overlay = null
  }

  show() {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.id = 'intro-overlay'
      overlay.innerHTML = `
        <canvas id="intro-canvas"></canvas>

        <div class="intro-content">
          <div class="intro-logo-wrap">
            <div class="intro-whale" id="intro-whale">🐋</div>
            <div class="intro-logo">
              WHALE<span>TRADER</span>
            </div>
            <div class="intro-tagline">Trade the ocean. Ride the wave.</div>
          </div>

          <div class="intro-divider"></div>

          <div class="intro-stats">
            <div class="intro-stat">
              <span class="istat-val" id="istat-price">$85,000</span>
              <span class="istat-label">BTC / USDT</span>
            </div>
            <div class="intro-stat-sep"></div>
            <div class="intro-stat">
              <span class="istat-val">$10,000</span>
              <span class="istat-label">SALDO DEMO</span>
            </div>
            <div class="intro-stat-sep"></div>
            <div class="intro-stat">
              <span class="istat-val">50x</span>
              <span class="istat-label">MAX LEVERAGE</span>
            </div>
          </div>

          <div class="intro-cards">
            <div class="intro-card long-card">
              <div class="icard-icon">↑</div>
              <div class="icard-title">LONG</div>
              <div class="icard-desc">Apuesta a que la ballena sube. Los pinchos aparecen abajo.</div>
            </div>
            <div class="intro-card short-card">
              <div class="icard-icon">↓</div>
              <div class="icard-title">SHORT</div>
              <div class="icard-desc">Apuesta a que la ballena baja. Los pinchos aparecen arriba.</div>
            </div>
          </div>

          <button class="intro-btn" id="intro-btn">
            <span class="btn-text">ENTRAR AL OCÉANO</span>
            <span class="btn-arrow">→</span>
          </button>

          <div class="intro-disclaimer">
            Solo para entretenimiento · Datos simulados · Sin dinero real
          </div>
        </div>
      `

      this._injectStyles()
      document.body.appendChild(overlay)
      this.overlay = overlay

      // Animated background canvas
      this._startBgAnimation()

      // Animate whale emoji
      this._animateWhale()

      // Animate BTC price counter
      this._animatePriceCounter()

      document.getElementById('intro-btn').onclick = () => {
        this._playExitAnimation().then(resolve)
      }
    })
  }

  _startBgAnimation() {
    const canvas = document.getElementById('intro-canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    const bubbles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * canvas.height,
      r: 2 + Math.random() * 8,
      speed: 0.4 + Math.random() * 1.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
    }))

    // Particles floating
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      alpha: Math.random(),
      speed: 0.2 + Math.random() * 0.5,
    }))

    let time = 0
    let animId

    const draw = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Deep ocean background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, '#010810')
      grad.addColorStop(0.4, '#021525')
      grad.addColorStop(1, '#010c18')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Light rays
      const rays = [0.15, 0.35, 0.55, 0.75, 0.9]
      rays.forEach((rx, i) => {
        const pulse = 0.03 + Math.sin(time * 0.4 + i * 1.2) * 0.02
        const x = rx * canvas.width + Math.sin(time * 0.2 + i) * 30
        const w = 60 + i * 20
        const grad2 = ctx.createLinearGradient(x, 0, x, canvas.height * 0.8)
        grad2.addColorStop(0, `rgba(26,111,168,${pulse * 2})`)
        grad2.addColorStop(1, 'rgba(26,111,168,0)')
        ctx.fillStyle = grad2
        ctx.beginPath()
        ctx.moveTo(x - w * 0.15, 0)
        ctx.lineTo(x + w * 0.15, 0)
        ctx.lineTo(x + w * 0.6, canvas.height * 0.8)
        ctx.lineTo(x - w * 0.6, canvas.height * 0.8)
        ctx.fill()
      })

      // Water surface
      ctx.beginPath()
      ctx.moveTo(0, 0)
      for (let i = 0; i <= canvas.width; i += 4) {
        const y = 3 + Math.sin(i * 0.015 + time * 0.8) * 4
                    + Math.sin(i * 0.03 + time * 1.1) * 2
        ctx.lineTo(i, y)
      }
      ctx.lineTo(canvas.width, 0)
      ctx.closePath()
      ctx.fillStyle = 'rgba(10,58,90,0.5)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(77,216,255,0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Bubbles
      bubbles.forEach(b => {
        b.wobble += b.wobbleSpeed
        b.y -= b.speed
        b.x += Math.sin(b.wobble) * 0.8
        if (b.y < -b.r * 2) {
          b.y = canvas.height + b.r
          b.x = Math.random() * canvas.width
        }
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(170,238,255,0.35)`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Floating BTC symbols
      particles.forEach(p => {
        p.y -= p.speed
        p.alpha = 0.1 + Math.abs(Math.sin(time * 0.5 + p.x)) * 0.3
        if (p.y < -20) {
          p.y = canvas.height + 20
          p.x = Math.random() * canvas.width
        }
        ctx.font = `${12 + p.size * 4}px Arial`
        ctx.fillStyle = `rgba(247,147,26,${p.alpha})`
        ctx.fillText('₿', p.x, p.y)
      })

      time += 0.016
      animId = requestAnimationFrame(draw)
    }

    draw()
    this._bgAnimId = animId
    this._bgCtx = ctx
    this._bgCanvas = canvas
  }

  _animateWhale() {
    const el = document.getElementById('intro-whale')
    let t = 0
    this._whaleInterval = setInterval(() => {
      t++
      el.style.transform = `
        translateY(${Math.sin(t * 0.08) * 12}px)
        rotate(${Math.sin(t * 0.05) * 5}deg)
        scale(${1 + Math.abs(Math.sin(t * 0.06)) * 0.08})
      `
    }, 30)
  }

  _animatePriceCounter() {
    const el = document.getElementById('istat-price')
    let price = 82000
    this._priceInterval = setInterval(() => {
      price += (Math.random() - 0.48) * 200
      price = Math.max(78000, Math.min(92000, price))
      el.textContent = `$${Math.round(price).toLocaleString('en-US')}`
      el.style.color = Math.random() > 0.5 ? '#00ff9d' : '#ff4466'
    }, 600)
  }

  _playExitAnimation() {
    return new Promise(resolve => {
      const overlay = this.overlay
      overlay.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
      overlay.style.opacity = '0'
      overlay.style.transform = 'scale(1.05)'
      setTimeout(() => {
        clearInterval(this._whaleInterval)
        clearInterval(this._priceInterval)
        cancelAnimationFrame(this._bgAnimId)
        overlay.remove()
        this.overlay = null
        resolve()
      }, 600)
    })
  }

  _injectStyles() {
    if (document.getElementById('intro-styles')) return
    const style = document.createElement('style')
    style.id = 'intro-styles'
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');

      @keyframes introFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes introPulse {
        0%,100% { box-shadow: 0 0 20px rgba(0,212,255,0.2); }
        50%      { box-shadow: 0 0 40px rgba(0,212,255,0.5); }
      }
      @keyframes btnGlow {
        0%,100% { box-shadow: 0 0 20px rgba(0,212,255,0.3), inset 0 0 20px rgba(0,212,255,0.05); }
        50%      { box-shadow: 0 0 40px rgba(0,212,255,0.6), inset 0 0 30px rgba(0,212,255,0.1); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }

      #intro-overlay {
        position: fixed;
        inset: 0;
        z-index: 8000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Space Mono', monospace;
        overflow: hidden;
      }

      #intro-canvas {
        position: absolute;
        inset: 0;
        z-index: 0;
      }

      .intro-content {
        position: relative;
        z-index: 1;
        width: 480px;
        max-width: 95vw;
        background: rgba(2,11,24,0.82);
        border: 1px solid rgba(0,180,255,0.25);
        border-radius: 24px;
        padding: 40px 36px;
        backdrop-filter: blur(16px);
        animation: introFadeIn 0.8s ease-out forwards, introPulse 4s ease-in-out infinite;
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: center;
        text-align: center;
      }

      .intro-logo-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .intro-whale {
        font-size: 72px;
        display: block;
        filter: drop-shadow(0 0 20px rgba(0,180,255,0.6));
      }

      .intro-logo {
        font-family: 'Orbitron', monospace;
        font-size: 36px;
        font-weight: 900;
        color: #00d4ff;
        letter-spacing: 4px;
        background: linear-gradient(90deg, #00d4ff, #ffffff, #00d4ff, #f7931a, #00d4ff);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
      }

      .intro-logo span {
        color: #ffffff;
      }

      .intro-tagline {
        font-size: 11px;
        color: #3a7898;
        letter-spacing: 3px;
        text-transform: uppercase;
      }

      .intro-divider {
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0,180,255,0.3), transparent);
      }

      .intro-stats {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        width: 100%;
      }

      .intro-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .istat-val {
        font-family: 'Orbitron', monospace;
        font-size: 14px;
        color: #00ff9d;
        font-weight: 700;
        transition: color 0.3s;
      }

      .istat-label {
        font-size: 8px;
        color: #2a5878;
        letter-spacing: 2px;
      }

      .intro-stat-sep {
        width: 1px;
        height: 32px;
        background: rgba(0,180,255,0.15);
      }

      .intro-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        width: 100%;
      }

      .intro-card {
        border-radius: 12px;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        border: 1px solid transparent;
        transition: transform 0.2s;
      }

      .intro-card:hover { transform: scale(1.03); }

      .long-card {
        background: rgba(0,180,100,0.08);
        border-color: rgba(0,200,120,0.2);
      }

      .short-card {
        background: rgba(255,40,80,0.08);
        border-color: rgba(255,60,90,0.2);
      }

      .icard-icon {
        font-size: 28px;
        font-weight: 900;
        font-family: 'Orbitron', monospace;
      }

      .long-card .icard-icon { color: #00ff9d; }
      .short-card .icard-icon { color: #ff4466; }

      .icard-title {
        font-family: 'Orbitron', monospace;
        font-size: 13px;
        font-weight: 700;
        color: #c8e8ff;
        letter-spacing: 2px;
      }

      .icard-desc {
        font-size: 9px;
        color: #3a6888;
        line-height: 1.6;
      }

      .intro-btn {
        width: 100%;
        padding: 16px;
        border: 1px solid rgba(0,212,255,0.4);
        border-radius: 12px;
        background: rgba(0,212,255,0.08);
        color: #00d4ff;
        font-family: 'Orbitron', monospace;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        animation: btnGlow 2s ease-in-out infinite;
        transition: background 0.2s, transform 0.15s;
      }

      .intro-btn:hover {
        background: rgba(0,212,255,0.18);
        transform: scale(1.02);
      }

      .btn-arrow {
        font-size: 18px;
        transition: transform 0.2s;
      }

      .intro-btn:hover .btn-arrow {
        transform: translateX(6px);
      }

      .intro-disclaimer {
        font-size: 8px;
        color: #1a3a50;
        letter-spacing: 1px;
      }
    `
    document.head.appendChild(style)
  }
}