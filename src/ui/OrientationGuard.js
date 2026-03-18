export class OrientationGuard {
  constructor() {
    this._injectStyles()
    this._buildOverlay()
    this._check()
    window.addEventListener('resize', () => this._check())
    screen.orientation?.addEventListener('change', () => this._check())
  }

  _buildOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'orientation-overlay'
    overlay.innerHTML = `
      <div class="orient-content">
        <div class="orient-whale">🐋</div>
        <div class="orient-phone" id="orient-phone">📱</div>
        <div class="orient-title">VOLTEA TU DISPOSITIVO</div>
        <div class="orient-subtitle">xBitDive funciona mejor en modo horizontal</div>
      </div>
    `
    document.body.appendChild(overlay)
    this.overlay = overlay
  }

  _check() {
    const isPortrait = window.innerHeight > window.innerWidth
    const isMobile = window.innerWidth <= 1024
    this.overlay.style.display = (isPortrait && isMobile) ? 'flex' : 'none'
  }

  _injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

      #orientation-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #020b18;
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      .orient-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
        padding: 32px;
      }

      .orient-whale {
        font-size: 64px;
        animation: whaleFloat 2s ease-in-out infinite;
      }

      .orient-phone {
        font-size: 48px;
        animation: phoneRotate 2s ease-in-out infinite;
      }

      @keyframes whaleFloat {
        0%,100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }

      @keyframes phoneRotate {
        0%   { transform: rotate(0deg); }
        50%  { transform: rotate(90deg); }
        100% { transform: rotate(90deg); }
      }

      .orient-title {
        font-family: 'Orbitron', monospace;
        font-size: 18px;
        font-weight: 900;
        color: #00d4ff;
        letter-spacing: 3px;
      }

      .orient-subtitle {
        font-size: 12px;
        color: #4a88aa;
        font-family: 'Space Mono', monospace;
        letter-spacing: 1px;
      }
    `
    document.head.appendChild(style)
  }
}