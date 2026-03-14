export class ResultScene {
  constructor() {
    this.overlay = null
  }

  show(type, data) {
    // type: 'liquidated' | 'win' | 'loss'
    this._remove()
    const overlay = document.createElement('div')
    overlay.id = 'result-overlay'

    const configs = {
      liquidated: {
        bg: 'radial-gradient(ellipse at center, #3a0010 0%, #0a0005 70%)',
        border: '#ff0033',
        glow: 'rgba(255,0,50,0.4)',
        emoji: '💀',
        title: 'LIQUIDADO',
        titleColor: '#ff2244',
        subtitle: 'La ballena fue destruida por los pinchos',
        pnlColor: '#ff4466',
      },
      win: {
        bg: 'radial-gradient(ellipse at center, #002a10 0%, #000a05 70%)',
        border: '#00ff9d',
        glow: 'rgba(0,255,100,0.3)',
        emoji: '🏆',
        title: '¡GANASTE!',
        titleColor: '#00ff9d',
        subtitle: 'La ballena nadó hacia la victoria',
        pnlColor: '#00ff9d',
      },
      loss: {
        bg: 'radial-gradient(ellipse at center, #1a0d00 0%, #080300 70%)',
        border: '#ff8800',
        glow: 'rgba(255,120,0,0.3)',
        emoji: '📉',
        title: 'PÉRDIDA',
        titleColor: '#ff8800',
        subtitle: 'La ballena sobrevivió pero está herida',
        pnlColor: '#ff8800',
      },
    }

    const cfg = configs[type]
    const pnl = data.pnl || 0
    const pnlSign = pnl >= 0 ? '+' : ''

    overlay.innerHTML = `
      <div class="result-card" style="border-color:${cfg.border};box-shadow:0 0 60px ${cfg.glow},0 0 120px ${cfg.glow}">
        <div class="result-bg" style="background:${cfg.bg}"></div>

        <div class="result-emoji" id="result-emoji">${cfg.emoji}</div>

        <div class="result-title" style="color:${cfg.titleColor}">${cfg.title}</div>
        <div class="result-subtitle">${cfg.subtitle}</div>

        <div class="result-divider" style="background:${cfg.border}"></div>

        <div class="result-stats">
          <div class="result-stat">
            <span class="stat-label">TIPO</span>
            <span class="stat-val">${data.posType?.toUpperCase() || '-'} ${data.leverage || ''}x</span>
          </div>
          <div class="result-stat">
            <span class="stat-label">ENTRADA</span>
            <span class="stat-val">$${(data.entryPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div class="result-stat">
            <span class="stat-label">CIERRE</span>
            <span class="stat-val">$${(data.closePrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div class="result-stat">
            <span class="stat-label">MONTO</span>
            <span class="stat-val">$${(data.amount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="result-pnl" style="color:${cfg.pnlColor}">
          ${pnlSign}$${Math.abs(pnl).toFixed(2)}
          <span class="result-pnl-pct">${pnlSign}${((pnl / (data.amount || 1)) * 100).toFixed(1)}%</span>
        </div>

        <div class="result-balance">
          Saldo: <strong>$${(data.newBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>

        <button class="result-btn" id="result-btn" style="border-color:${cfg.border};color:${cfg.titleColor}">
          ${type === 'liquidated' ? '🔄 REVIVIR BALLENA' : '🐋 SEGUIR TRADING'}
        </button>
      </div>
    `

    this._injectStyles()
    document.body.appendChild(overlay)
    this.overlay = overlay

    // Animate emoji
    const emojiEl = document.getElementById('result-emoji')
    if (type === 'liquidated') this._animateLiquidated(emojiEl)
    else if (type === 'win') this._animateWin(emojiEl)
    else this._animateLoss(emojiEl)

    return new Promise(resolve => {
      document.getElementById('result-btn').onclick = () => {
        this._remove()
        resolve()
      }
    })
  }

  _animateLiquidated(el) {
    let frame = 0
    const frames = ['💀', '🩸', '💀', '☠️', '💀', '🩸', '☠️', '💀']
    const interval = setInterval(() => {
      el.textContent = frames[frame % frames.length]
      el.style.transform = `scale(${1 + Math.sin(frame * 0.5) * 0.15}) rotate(${Math.sin(frame * 0.3) * 10}deg)`
      frame++
    }, 120)
    el.dataset.interval = interval
  }

  _animateWin(el) {
    let frame = 0
    const frames = ['🏆', '🐋', '💰', '₿', '🎉', '🏆', '🌊', '💎']
    const interval = setInterval(() => {
      el.textContent = frames[frame % frames.length]
      el.style.transform = `scale(${1 + Math.abs(Math.sin(frame * 0.4)) * 0.2}) translateY(${Math.sin(frame * 0.5) * 8}px)`
      frame++
    }, 150)
    el.dataset.interval = interval
  }

  _animateLoss(el) {
    let frame = 0
    const frames = ['📉', '🐋', '😢', '📉', '💸', '😭', '📉']
    const interval = setInterval(() => {
      el.textContent = frames[frame % frames.length]
      el.style.transform = `translateY(${Math.abs(Math.sin(frame * 0.3)) * 5}px)`
      frame++
    }, 200)
    el.dataset.interval = interval
  }

  _remove() {
    if (this.overlay) {
      const emojiEl = document.getElementById('result-emoji')
      if (emojiEl?.dataset.interval) clearInterval(emojiEl.dataset.interval)
      this.overlay.remove()
      this.overlay = null
    }
  }

  _injectStyles() {
    if (document.getElementById('result-styles')) return
    const style = document.createElement('style')
    style.id = 'result-styles'
    style.textContent = `
      @keyframes resultFadeIn {
        from { opacity:0; transform: scale(0.85) translateY(30px); }
        to   { opacity:1; transform: scale(1) translateY(0); }
      }
      @keyframes resultBgPulse {
        0%,100% { opacity: 1; }
        50%      { opacity: 0.7; }
      }

      #result-overlay {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(6px);
        font-family: 'Space Mono', monospace;
      }

      .result-card {
        position: relative;
        width: 380px;
        border: 1px solid;
        border-radius: 20px;
        padding: 36px 32px;
        text-align: center;
        overflow: hidden;
        animation: resultFadeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
      }

      .result-bg {
        position: absolute;
        inset: 0;
        z-index: 0;
        animation: resultBgPulse 3s ease-in-out infinite;
      }

      .result-card > * { position: relative; z-index: 1; }

      .result-emoji {
        font-size: 72px;
        display: block;
        margin-bottom: 16px;
        transition: transform 0.1s;
      }

      .result-title {
        font-family: 'Orbitron', monospace;
        font-size: 28px;
        font-weight: 900;
        letter-spacing: 4px;
        margin-bottom: 8px;
      }

      .result-subtitle {
        font-size: 11px;
        color: #4a7898;
        margin-bottom: 20px;
        letter-spacing: 1px;
      }

      .result-divider {
        height: 1px;
        opacity: 0.3;
        margin-bottom: 20px;
      }

      .result-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }

      .result-stat {
        background: rgba(255,255,255,0.04);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stat-label {
        font-size: 8px;
        color: #2a5878;
        letter-spacing: 2px;
      }

      .stat-val {
        font-family: 'Orbitron', monospace;
        font-size: 12px;
        color: #c8e8ff;
      }

      .result-pnl {
        font-family: 'Orbitron', monospace;
        font-size: 40px;
        font-weight: 900;
        margin-bottom: 8px;
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 10px;
      }

      .result-pnl-pct {
        font-size: 16px;
        opacity: 0.8;
      }

      .result-balance {
        font-size: 11px;
        color: #4a7898;
        margin-bottom: 24px;
      }

      .result-balance strong {
        color: #c8e8ff;
        font-family: 'Orbitron', monospace;
      }

      .result-btn {
        width: 100%;
        padding: 14px;
        border: 1px solid;
        border-radius: 10px;
        background: rgba(255,255,255,0.05);
        font-family: 'Orbitron', monospace;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .result-btn:hover {
        background: rgba(255,255,255,0.12);
        transform: scale(1.02);
      }
    `
    document.head.appendChild(style)
  }
}