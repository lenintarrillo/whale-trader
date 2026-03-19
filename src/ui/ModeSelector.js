export class ModeSelector {
  constructor() {
    this._injectStyles()
  }

  show() {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.id = 'mode-selector'
      overlay.innerHTML = `
        <div class="mode-content">
          <div class="mode-logo">x<span>BitDive</span></div>
          <div class="mode-whale">🐋</div>
          <div class="mode-question">¿Cómo quieres jugar?</div>

          <div class="mode-cards">
            <div class="mode-card" id="mode-simple">
              <div class="mode-card-icon">🎮</div>
              <div class="mode-card-title">MODO SIMPLE</div>
              <div class="mode-card-desc">
                Apuesta a que la ballena sube o baja.<br>
                Sin experiencia necesaria.
              </div>
              <div class="mode-card-tag simple-tag">⭐ RECOMENDADO</div>
            </div>

            <div class="mode-card" id="mode-pro">
              <div class="mode-card-icon">📊</div>
              <div class="mode-card-title">MODO PRO</div>
              <div class="mode-card-desc">
                Long / Short con apalancamiento.<br>
                Stop Loss y Take Profit.
              </div>
              <div class="mode-card-tag pro-tag">🎯 TRADING REAL</div>
            </div>
          </div>

          <div class="mode-disclaimer">
            Precio real de Bitcoin · Solo entretenimiento · Sin dinero real
          </div>
        </div>
      `

      document.body.appendChild(overlay)
      this.overlay = overlay

      document.getElementById('mode-simple').onclick = () => {
        this._exit(() => resolve('simple'))
      }
      document.getElementById('mode-pro').onclick = () => {
        this._exit(() => resolve('pro'))
      }
    })
  }

  _exit(cb) {
    this.overlay.style.opacity = '0'
    this.overlay.style.transform = 'scale(1.04)'
    setTimeout(() => {
      this.overlay.remove()
      cb()
    }, 400)
  }

  _injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');

      #mode-selector {
        position: fixed;
        inset: 0;
        z-index: 9000;
        background: rgba(2,11,24,0.97);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Space Mono', monospace;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .mode-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        text-align: center;
        padding: 24px;
        max-width: 600px;
        width: 100%;
      }

      .mode-logo {
        font-family: 'Orbitron', monospace;
        font-size: 28px;
        font-weight: 900;
        color: #00d4ff;
        letter-spacing: 4px;
      }
      .mode-logo span { color: #fff; }

      .mode-whale {
        font-size: 64px;
        animation: modeWhale 2s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(0,180,255,0.5));
      }

      @keyframes modeWhale {
        0%,100% { transform: translateY(0) rotate(-3deg); }
        50%      { transform: translateY(-12px) rotate(3deg); }
      }

      .mode-question {
        font-family: 'Orbitron', monospace;
        font-size: 16px;
        color: #c8e8ff;
        letter-spacing: 2px;
      }

      .mode-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        width: 100%;
      }

      @media (max-width: 500px) {
        .mode-cards { grid-template-columns: 1fr; }
      }

      .mode-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(0,180,255,0.2);
        border-radius: 16px;
        padding: 24px 16px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        transition: all 0.2s;
      }

      .mode-card:hover {
        transform: translateY(-4px);
        border-color: rgba(0,212,255,0.5);
        background: rgba(0,180,255,0.08);
      }

      #mode-simple { border-color: rgba(0,255,157,0.3); }
      #mode-simple:hover { border-color: #00ff9d; background: rgba(0,255,157,0.06); }

      #mode-pro { border-color: rgba(0,180,255,0.3); }
      #mode-pro:hover { border-color: #00d4ff; background: rgba(0,180,255,0.06); }

      .mode-card-icon { font-size: 40px; }

      .mode-card-title {
        font-family: 'Orbitron', monospace;
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        letter-spacing: 2px;
      }

      .mode-card-desc {
        font-size: 11px;
        color: #4a88aa;
        line-height: 1.8;
      }

      .mode-card-tag {
        font-size: 9px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 20px;
        letter-spacing: 1px;
        margin-top: 4px;
      }

      .simple-tag {
        background: rgba(0,255,157,0.12);
        border: 1px solid rgba(0,255,157,0.3);
        color: #00ff9d;
      }

      .pro-tag {
        background: rgba(0,180,255,0.12);
        border: 1px solid rgba(0,180,255,0.3);
        color: #00d4ff;
      }

      .mode-disclaimer {
        font-size: 9px;
        color: #1a3a50;
        letter-spacing: 1px;
      }
    `
    document.head.appendChild(style)
  }
}