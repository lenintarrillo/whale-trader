export class GameHUD {
  constructor() {
    this._injectStyles()
    this._build()
    this.lastPnl = 0
    this.floatingInterval = null
  }

  _build() {
    const hud = document.createElement('div')
    hud.id = 'game-hud'
    hud.innerHTML = `
      <div class="hud-left">
        <span class="hud-label">BALANCE</span>
        <span class="hud-balance" id="hud-balance">$1,000.00</span>
      </div>
      <div class="hud-center" id="hud-pnl-wrap" style="display:none">
        <span class="hud-label">GANANCIA</span>
        <span class="hud-pnl" id="hud-pnl">$0.00</span>
      </div>
      <div class="hud-right">
        <span class="hud-btc" id="hud-btc">BTC $85,000</span>
      </div>
    `
    document.body.appendChild(hud)
    this.hud = hud
  }

  updateBalance(balance) {
    const el = document.getElementById('hud-balance')
    if (el) el.textContent = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  updatePnL(pnl) {
    const wrap = document.getElementById('hud-pnl-wrap')
    const el = document.getElementById('hud-pnl')
    if (!el || !wrap) return

    if (pnl === null) {
      wrap.style.display = 'none'
      this.lastPnl = 0
      return
    }

    wrap.style.display = 'flex'
    el.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
    el.className = `hud-pnl ${pnl >= 0 ? 'pnl-up' : 'pnl-dn'}`

    // Floating +/- every $5 change
    const diff = pnl - this.lastPnl
    if (Math.abs(diff) >= 5) {
      this._spawnFloating(diff, pnl >= 0)
      this.lastPnl = pnl
    }

    // Special animation > $50 gain
    if (pnl >= 50) {
      el.classList.add('pnl-big-win')
    } else {
      el.classList.remove('pnl-big-win')
    }
  }

  updateBtcPrice(price) {
    const el = document.getElementById('hud-btc')
    if (el) el.textContent = `BTC $${Math.round(price).toLocaleString('en-US')}`
  }

  _spawnFloating(diff, isUp) {
    const el = document.createElement('div')
    el.className = `hud-float ${isUp ? 'float-up' : 'float-dn'}`
    el.textContent = `${isUp ? '+' : ''}$${Math.abs(diff).toFixed(0)}`

    // Random position in the ocean area
    const x = 20 + Math.random() * (window.innerWidth - 320)
    const y = 100 + Math.random() * (window.innerHeight - 200)
    el.style.left = `${x}px`
    el.style.top = `${y}px`

    document.body.appendChild(el)
    setTimeout(() => el.remove(), 1500)
  }

  show() { this.hud.style.display = 'flex' }
  hide() { this.hud.style.display = 'none' }

  _injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono&display=swap');

      #game-hud {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 900;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: rgba(2,11,24,0.7);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid rgba(0,180,255,0.12);
        font-family: 'Space Mono', monospace;
        pointer-events: none;
      }

      .hud-left, .hud-center, .hud-right {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .hud-label {
        font-size: 7px;
        color: #2a6888;
        letter-spacing: 2px;
        font-family: 'Orbitron', monospace;
      }

      .hud-balance {
        font-family: 'Orbitron', monospace;
        font-size: 14px;
        font-weight: 700;
        color: #fff;
      }

      .hud-pnl {
        font-family: 'Orbitron', monospace;
        font-size: 18px;
        font-weight: 900;
        transition: color 0.3s;
      }

      .pnl-up { color: #00ff9d; }
      .pnl-dn { color: #ff4466; }

      @keyframes bigWin {
        0%,100% { transform: scale(1); filter: drop-shadow(0 0 8px #00ff9d); }
        50%      { transform: scale(1.15); filter: drop-shadow(0 0 20px #00ff9d); }
      }

      .pnl-big-win {
        animation: bigWin 0.8s ease-in-out infinite;
      }

      .hud-btc {
        font-family: 'Orbitron', monospace;
        font-size: 11px;
        color: #4a88aa;
      }

      /* Floating PnL */
      .hud-float {
        position: fixed;
        font-family: 'Orbitron', monospace;
        font-size: 20px;
        font-weight: 900;
        pointer-events: none;
        z-index: 800;
        animation: floatUp 1.5s ease-out forwards;
      }

      .float-up { color: #00ff9d; text-shadow: 0 0 10px rgba(0,255,157,0.6); }
      .float-dn { color: #ff4466; text-shadow: 0 0 10px rgba(255,68,102,0.6); }

      @keyframes floatUp {
        0%   { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-80px) scale(1.3); }
      }
    `
    document.head.appendChild(style)
  }
}