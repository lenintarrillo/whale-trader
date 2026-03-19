export class SimpleTradingPanel {
  constructor(onOpen, onClose) {
    this.onOpen = onOpen
    this.onClose = onClose
    this.amount = 100
    this.leverage = 10
    this._build()
  }

  _build() {
    const panel = document.createElement('div')
    panel.id = 'trading-panel'
    panel.innerHTML = `
      <div class="panel-header">
        <span class="logo">x<span>BitDive</span></span>
        <div class="btc-ticker">
          <span class="ticker-label">BITCOIN</span>
          <span id="btc-price">$85,000</span>
          <span id="price-change" class="up">▲ 0.00%</span>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">TU SALDO</div>
        <div id="balance" class="balance-val">$1,000.00</div>
      </div>

      <div class="panel-section" id="open-controls">
        <div class="section-title">NUEVA APUESTA</div>

        <div class="control-row">
          <span class="ctrl-label">Tu apuesta</span>
          <div class="stepper">
            <button class="step-btn" id="amt-down">−</button>
            <span id="amt-val" class="step-val">$100</span>
            <button class="step-btn" id="amt-up">+</button>
          </div>
        </div>

        <div class="control-row">
          <span class="ctrl-label">Velocidad</span>
          <div class="lev-grid">
            <button class="lev-btn" data-lev="5">5x</button>
            <button class="lev-btn active" data-lev="10">10x</button>
            <button class="lev-btn" data-lev="25">25x</button>
            <button class="lev-btn" data-lev="50">50x</button>
            <button class="lev-btn" data-lev="75">75x</button>
            <button class="lev-btn" data-lev="100">100x</button>
          </div>
        </div>

        <div class="control-row">
          <span class="ctrl-label">Ganancia posible</span>
          <span id="pos-size" class="ctrl-val">$1,000</span>
        </div>

        <div class="simple-hint">
          🐋 La ballena sube y baja con el precio real de Bitcoin
        </div>

        <div class="action-row">
          <button class="btn-long" id="btn-long">🚀 SUBE</button>
          <button class="btn-short" id="btn-short">📉 BAJA</button>
        </div>
      </div>

      <div class="panel-section" id="position-section" style="display:none">
        <div class="section-title">APUESTA ACTIVA</div>
        <div id="pos-type" class="pos-type-label"></div>
        <div class="pos-grid">
          <div class="pos-row"><span>Entraste en</span><span id="pos-entry">-</span></div>
          <div class="pos-row"><span>Precio ahora</span><span id="pos-current">-</span></div>
          <div class="pos-row"><span>Te liquidas en</span><span id="pos-liq" class="liq-val">-</span></div>
          <div class="pos-row"><span>Ganancia</span><span id="pos-pnl">-</span></div>
        </div>

        <div class="danger-bar-wrap">
          <div class="danger-bar-label">⚠️ Riesgo de perder todo</div>
          <div class="danger-bar-track">
            <div id="danger-bar" class="danger-bar-fill"></div>
          </div>
        </div>

        <button class="btn-close" id="btn-close">✕ COBRAR Y SALIR</button>
      </div>

      <div class="panel-section">
        <div class="section-title">HISTORIAL</div>
        <div id="history-list" class="history-list">
          <div class="history-empty">Sin apuestas aún</div>
        </div>
      </div>
    `
    document.body.appendChild(panel)
    this._injectStyles()
    this._bindEvents()
  }

  _bindEvents() {
    document.getElementById('amt-up').onclick = () => {
      this.amount = Math.min(this.amount + 50, 5000)
      this._refreshControls()
    }
    document.getElementById('amt-down').onclick = () => {
      this.amount = Math.max(this.amount - 50, 50)
      this._refreshControls()
    }
    document.querySelectorAll('.lev-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.lev-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        this.leverage = parseInt(btn.dataset.lev)
        this._refreshControls()
      }
    })
    document.getElementById('btn-long').onclick = () =>
      this.onOpen('long', this.amount, this.leverage, null, null)
    document.getElementById('btn-short').onclick = () =>
      this.onOpen('short', this.amount, this.leverage, null, null)
    document.getElementById('btn-close').onclick = () => this.onClose()
  }

  _refreshControls() {
    document.getElementById('amt-val').textContent = `$${this.amount}`
    document.getElementById('pos-size').textContent =
      `$${(this.amount * this.leverage).toLocaleString('en-US')}`
  }

  updatePrice(price, prevPrice) {
    const el = document.getElementById('btc-price')
    const chEl = document.getElementById('price-change')
    if (!el) return
    el.textContent = `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    if (prevPrice) {
      const pct = ((price - prevPrice) / prevPrice) * 100
      chEl.textContent = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`
      chEl.className = pct >= 0 ? 'up' : 'dn'
    }
  }

  updateState(state) {
    const { balance, position, history } = state
    document.getElementById('balance').textContent =
      `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const openCtrl = document.getElementById('open-controls')
    const posSec = document.getElementById('position-section')

    if (position) {
      openCtrl.style.display = 'none'
      posSec.style.display = 'block'

      const isLong = position.type === 'long'
      document.getElementById('pos-type').textContent = isLong ? '🚀 Apostaste a que SUBE' : '📉 Apostaste a que BAJA'
      document.getElementById('pos-type').className = `pos-type-label ${isLong ? 'long' : 'short'}`
      document.getElementById('pos-entry').textContent =
        `$${position.entryPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      document.getElementById('pos-current').textContent =
        `$${(position.currentPrice || position.entryPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      document.getElementById('pos-liq').textContent =
        `$${position.liqPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

      const pnl = position.pnl || 0
      const pnlEl = document.getElementById('pos-pnl')
      pnlEl.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
      pnlEl.className = pnl >= 0 ? 'up' : 'dn'

    } else {
      openCtrl.style.display = 'block'
      posSec.style.display = 'none'
    }

    if (history.length > 0) {
      const listEl = document.getElementById('history-list')
      listEl.innerHTML = history.slice(0, 20).map(h => {
        const typeLabel = h.type === 'long' ? '🚀 SUBE' : '📉 BAJA'
        const triggerLabel = h.liquidated ? '💀 LIQUIDADO'
          : h.trigger === 'sl' ? '🛑 SL'
          : h.trigger === 'tp' ? '🎯 TP'
          : '✓ COBRADO'
        return `
          <div class="history-item ${h.pnl >= 0 ? 'win' : 'loss'}">
            <span>${typeLabel} ${h.leverage}x</span>
            <span>${triggerLabel}</span>
            <span class="${h.pnl >= 0 ? 'up' : 'dn'}">${h.pnl >= 0 ? '+' : ''}$${h.pnl.toFixed(2)}</span>
          </div>
        `
      }).join('')
    }
  }

  updateDangerBar(ratio) {
    const bar = document.getElementById('danger-bar')
    if (!bar) return
    bar.style.width = `${(ratio * 100).toFixed(1)}%`
    bar.style.background = ratio > 0.7 ? '#ff2244' : ratio > 0.4 ? '#ff8800' : '#00cc66'
  }

  _injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');

      #trading-panel {
        position: fixed;
        right: 16px; top: 16px; bottom: 16px;
        width: 265px;
        background: rgba(2,11,24,0.88);
        border: 1px solid rgba(0,180,255,0.18);
        border-radius: 14px;
        padding: 14px;
        overflow-y: auto;
        z-index: 1000;
        font-family: 'Space Mono', monospace;
        color: #c8e8ff;
        backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        gap: 12px;
        scrollbar-width: none;
      }
      #trading-panel::-webkit-scrollbar { display: none; }

      .panel-header {
        display: flex; flex-direction: column; gap: 6px;
        border-bottom: 1px solid rgba(0,180,255,0.12);
        padding-bottom: 10px;
      }
      .logo {
        font-family: 'Orbitron', monospace;
        font-size: 16px; font-weight: 900;
        color: #00d4ff; letter-spacing: 2px;
      }
      .logo span { color: #fff; }
      .btc-ticker { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .ticker-label { font-size: 9px; color: #4a88aa; letter-spacing: 1px; }
      #btc-price { font-family: 'Orbitron', monospace; font-size: 15px; color: #fff; }
      .up { color: #00ff9d; }
      .dn { color: #ff4466; }

      .panel-section { display: flex; flex-direction: column; gap: 8px; }
      .section-title { font-size: 8px; letter-spacing: 2px; color: #2a6888; font-family: 'Orbitron', monospace; }
      .balance-val { font-family: 'Orbitron', monospace; font-size: 20px; color: #fff; font-weight: 700; }

      .control-row { display: flex; align-items: center; justify-content: space-between; }
      .ctrl-label { font-size: 10px; color: #4a88aa; }
      .ctrl-val { font-size: 12px; color: #e0f4ff; }

      .stepper { display: flex; align-items: center; gap: 6px; }
      .step-btn {
        width: 26px; height: 26px;
        background: rgba(0,160,220,0.12);
        border: 1px solid rgba(0,160,220,0.3);
        border-radius: 6px; color: #00d4ff;
        font-size: 18px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Space Mono', monospace;
        transition: background 0.15s;
      }
      .step-btn:hover { background: rgba(0,160,220,0.28); }
      .step-val { font-family: 'Orbitron', monospace; font-size: 12px; color: #fff; min-width: 46px; text-align: center; }

      .lev-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 4px; }
      .lev-btn {
        background: rgba(0,160,220,0.08);
        border: 1px solid rgba(0,160,220,0.18);
        border-radius: 5px; color: #4a88aa;
        font-size: 10px; cursor: pointer;
        padding: 5px 0; text-align: center;
        transition: all 0.15s;
        font-family: 'Space Mono', monospace;
      }
      .lev-btn:hover, .lev-btn.active {
        background: rgba(0,200,255,0.22);
        border-color: #00d4ff; color: #fff;
      }

      .simple-hint {
        font-size: 9px;
        color: #2a6888;
        text-align: center;
        padding: 6px 8px;
        background: rgba(0,180,255,0.05);
        border-radius: 6px;
        line-height: 1.6;
      }

      .action-row { display: flex; gap: 8px; margin-top: 4px; }
      .btn-long {
        flex: 1; padding: 14px 0; border: none; border-radius: 8px;
        background: linear-gradient(135deg, #00c87a, #008f56);
        color: #fff; font-family: 'Orbitron', monospace;
        font-size: 11px; font-weight: 700; letter-spacing: 1px;
        cursor: pointer; transition: opacity 0.15s, transform 0.1s;
      }
      .btn-short {
        flex: 1; padding: 14px 0; border: none; border-radius: 8px;
        background: linear-gradient(135deg, #ff3355, #bb1133);
        color: #fff; font-family: 'Orbitron', monospace;
        font-size: 11px; font-weight: 700; letter-spacing: 1px;
        cursor: pointer; transition: opacity 0.15s, transform 0.1s;
      }
      .btn-long:hover, .btn-short:hover { opacity: 0.82; transform: scale(0.97); }

      .pos-type-label { font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; }
      .pos-type-label.long { color: #00ff9d; }
      .pos-type-label.short { color: #ff4466; }

      .pos-grid { display: flex; flex-direction: column; gap: 5px; }
      .pos-row { display: flex; justify-content: space-between; font-size: 10px; }
      .pos-row span:first-child { color: #4a88aa; }
      .liq-val { color: #ff4466; font-weight: 700; }

      .danger-bar-wrap { margin-top: 4px; }
      .danger-bar-label { font-size: 9px; color: #ff8844; margin-bottom: 4px; letter-spacing: 1px; }
      .danger-bar-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
      .danger-bar-fill { height: 100%; width: 0%; background: #00cc66; border-radius: 3px; transition: width 0.3s, background 0.3s; }

      .btn-close {
        width: 100%; padding: 12px;
        border: 1px solid rgba(0,255,157,0.4);
        border-radius: 8px;
        background: rgba(0,255,157,0.08);
        color: #00ff9d; font-family: 'Orbitron', monospace;
        font-size: 9px; font-weight: 700; letter-spacing: 1px;
        cursor: pointer; transition: all 0.15s;
      }
      .btn-close:hover { background: rgba(0,255,157,0.18); }

      .history-list { display: flex; flex-direction: column; gap: 5px; }
      .history-empty { font-size: 10px; color: #2a5070; text-align: center; padding: 8px 0; }
      .history-item {
        display: flex; justify-content: space-between;
        font-size: 9px; padding: 6px 8px;
        border-radius: 6px;
        background: rgba(255,255,255,0.04);
        border-left: 2px solid transparent;
      }
      .history-item.win { border-left-color: #00cc66; }
      .history-item.loss { border-left-color: #ff3355; }
    `
    document.head.appendChild(style)
  }
}