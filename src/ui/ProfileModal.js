export class ProfileModal {
  constructor() {
    this._injectStyles()
    this._buildTrigger()
  }

  _buildTrigger() {
    const btn = document.createElement('div')
    btn.id = 'profile-trigger'
    btn.innerHTML = `
      <div class="trigger-ring"></div>
      <img src="/assets/leninprofile.png" alt="Lenin" id="profile-avatar" />
    `
    btn.onclick = () => this._openModal()
    document.body.appendChild(btn)
  }

  _openModal() {
      Analytics.viewProfile()

    if (document.getElementById('profile-modal')) return

    const modal = document.createElement('div')
    modal.id = 'profile-modal'
    modal.innerHTML = `
      <div class="profile-card">
        <button class="profile-close" id="profile-close">✕</button>

        <div class="profile-header">
          <div class="profile-avatar-wrap">
            <img src="/assets/leninprofile.png" alt="Lenin Tarrillo" class="profile-img" />
            <div class="profile-avatar-ring"></div>
          </div>
          <div class="profile-info">
            <div class="profile-name">Lenin Tarrillo</div>
            <div class="profile-role">Lider de Cripto & Blockchain del BCP</div>
            <div class="profile-location">📍 Lima, Perú</div>
          </div>
        </div>

        <div class="profile-divider"></div>

        <div class="profile-bio">
          <p>
            WhaleTrader es una plataforma de trading gamificada donde el precio real de Bitcoin
            cobra vida en el océano. La ballena sube y baja con el mercado — tú decides si apostar
            al alza o a la baja. Aprende trading de futuros de forma visual, intuitiva y sin
            arriesgar dinero real.
          </p>
        </div>

        <div class="profile-divider"></div>

        <div class="profile-links">
          <a href="https://www.linkedin.com/in/lenintv/" target="_blank" class="profile-link linkedin">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Conectar en LinkedIn
          </a>
        </div>

        <div class="profile-footer">
          <span class="profile-tag">🐋 Creador de WhaleTrader</span>
        </div>
      </div>
    `

    document.body.appendChild(modal)
    document.getElementById('profile-close').onclick = () => modal.remove()
    modal.onclick = (e) => { if (e.target === modal) modal.remove() }
  }

  _injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');

      #profile-trigger {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 1000;
        cursor: pointer;
        width: 48px;
        height: 48px;
        transition: transform 0.2s;
        pointer-events: all;
      }
      #profile-trigger:hover { transform: scale(1.08); }

      .trigger-ring {
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        border: 1.5px solid rgba(0,212,255,0.5);
        animation: triggerPulse 2.5s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes triggerPulse {
        0%,100% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 0 rgba(0,212,255,0.3); }
        50%      { transform: scale(1.08); opacity: 1; box-shadow: 0 0 0 4px rgba(0,212,255,0.1); }
      }

      #profile-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid rgba(0,212,255,0.4);
        object-fit: cover;
        display: block;
        box-shadow: 0 0 14px rgba(0,212,255,0.25);
      }

      #profile-modal {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(8px);
        font-family: 'Space Mono', monospace;
      }

      .profile-card {
        position: relative;
        width: 370px;
        background: rgba(2,11,24,0.96);
        border: 1px solid rgba(0,180,255,0.22);
        border-radius: 22px;
        padding: 32px 28px 24px;
        color: #c8e8ff;
        animation: profileFadeIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        box-shadow: 0 0 50px rgba(0,180,255,0.12), 0 20px 60px rgba(0,0,0,0.5);
      }

      @keyframes profileFadeIn {
        from { opacity: 0; transform: scale(0.88) translateY(24px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }

      .profile-close {
        position: absolute;
        top: 14px; right: 14px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 50%;
        width: 28px; height: 28px;
        color: #4a88aa;
        font-size: 12px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s;
        font-family: 'Space Mono', monospace;
      }
      .profile-close:hover { background: rgba(255,60,80,0.18); color: #ff4466; }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 18px;
        margin-bottom: 20px;
      }

      .profile-avatar-wrap {
        position: relative;
        flex-shrink: 0;
      }

      .profile-img {
        width: 80px; height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 2.5px solid rgba(0,212,255,0.45);
        display: block;
      }

      .profile-avatar-ring {
        position: absolute;
        inset: -5px;
        border-radius: 50%;
        border: 1.5px solid rgba(0,212,255,0.18);
        animation: ringPulse 2.5s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes ringPulse {
        0%,100% { transform: scale(1); opacity: 0.3; }
        50%      { transform: scale(1.06); opacity: 0.7; }
      }

      .profile-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .profile-name {
        font-family: 'Orbitron', monospace;
        font-size: 17px;
        font-weight: 700;
        color: #fff;
        letter-spacing: 1px;
      }

      .profile-role {
        font-size: 9px;
        color: #4a88aa;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .profile-location {
        font-size: 10px;
        color: #2a6888;
      }

      .profile-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0,180,255,0.2), transparent);
        margin: 16px 0;
      }

      .profile-bio p {
        font-size: 11px;
        color: #6a98b8;
        line-height: 1.9;
        margin: 0;
      }

      .profile-links {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .profile-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: 1px;
        transition: all 0.2s;
      }

      .profile-link.linkedin {
        background: rgba(0,119,181,0.1);
        border: 1px solid rgba(0,119,181,0.3);
        color: #0aacff;
      }
      .profile-link.linkedin:hover {
        background: rgba(0,119,181,0.22);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,119,181,0.2);
      }

      .profile-footer {
        margin-top: 16px;
        text-align: center;
      }

      .profile-tag {
        font-size: 9px;
        color: #1a4a68;
        letter-spacing: 2px;
      }
    `
    document.head.appendChild(style)
  }
}