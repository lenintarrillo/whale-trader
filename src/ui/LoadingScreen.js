export class LoadingScreen {
  constructor() {
    this._injectStyles()
    this._build()
  }

  _build() {
    const overlay = document.createElement('div')
    overlay.id = 'loading-screen'
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-whale">🐋</div>
        <div class="loading-logo">x<span>BitDive</span></div>
        <div class="loading-bar-wrap">
          <div class="loading-bar" id="loading-bar"></div>
        </div>
        <div class="loading-text" id="loading-text">Conectando al océano...</div>
      </div>
    `
    document.body.appendChild(overlay)
    this.overlay = overlay
    this.bar = overlay.querySelector('#loading-bar')
    this.text = overlay.querySelector('#loading-text')
    this._animateBar()
  }

  _animateBar() {
    const messages = [
      'Conectando al océano...',
      'Cargando precio de Bitcoin...',
      'Preparando la ballena...',
      'Afilando los pinchos...',
      '¡Listo para tradear!',
    ]
    let progress = 0
    let msgIdx = 0

    this._barInterval = setInterval(() => {
      progress += 4 + Math.random() * 8
      if (progress > 95) progress = 95
      this.bar.style.width = `${progress}%`
      if (msgIdx < messages.length - 1 && progress > (msgIdx + 1) * 20) {
        msgIdx++
        this.text.textContent = messages[msgIdx]
      }
    }, 200)
  }

  hide() {
    clearInterval(this._barInterval)
    this.bar.style.width = '100%'
    this.text.textContent = '¡Listo para tradear!'
    setTimeout(() => {
      this.overlay.style.opacity = '0'
      this.overlay.style.transform = 'scale(1.05)'
      setTimeout(() => this.overlay.remove(), 500)
    }, 300)
  }

  _injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono&display=swap');

      #loading-screen {
        position: fixed;
        inset: 0;
        z-index: 99998;
        background: #020b18;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s ease, transform 0.5s ease;
      }

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
      }

      .loading-whale {
        font-size: 72px;
        animation: loadWhale 1.5s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(0,180,255,0.5));
      }

      @keyframes loadWhale {
        0%,100% { transform: translateY(0) rotate(-5deg); }
        50%      { transform: translateY(-15px) rotate(5deg); }
      }

      .loading-logo {
        font-family: 'Orbitron', monospace;
        font-size: 32px;
        font-weight: 900;
        color: #00d4ff;
        letter-spacing: 4px;
      }

      .loading-logo span { color: #fff; }

      .loading-bar-wrap {
        width: 240px;
        height: 4px;
        background: rgba(0,180,255,0.1);
        border-radius: 2px;
        overflow: hidden;
        border: 1px solid rgba(0,180,255,0.2);
      }

      .loading-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #00d4ff, #00ff9d);
        border-radius: 2px;
        transition: width 0.3s ease;
        box-shadow: 0 0 8px rgba(0,212,255,0.6);
      }

      .loading-text {
        font-family: 'Space Mono', monospace;
        font-size: 10px;
        color: #4a88aa;
        letter-spacing: 2px;
      }
    `
    document.head.appendChild(style)
  }
}