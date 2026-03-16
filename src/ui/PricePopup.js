export class PricePopup {
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'price-popup-container'
    this.container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 500;
      overflow: hidden;
    `
    document.body.appendChild(this.container)
    this._injectStyles()

    // Current price tag that follows the whale
    this.priceTag = document.createElement('div')
    this.priceTag.id = 'price-tag'
    this.priceTag.textContent = '$85,000'
    this.container.appendChild(this.priceTag)

    this.lastPrice = 0
    this.popupQueue = []
    this.isProcessing = false
  }

  update(price, whaleX, whaleY) {
    // Update floating price tag position near whale
    this.priceTag.style.left = `${whaleX + 80}px`
    this.priceTag.style.top = `${whaleY - 40}px`
    this.priceTag.textContent = `$${Math.round(price).toLocaleString('en-US')}`

    if (this.lastPrice === 0) {
      this.lastPrice = price
      return
    }

    const diff = price - this.lastPrice
    const absDiff = Math.abs(diff)

    // Only show popup if change is significant enough
    if (absDiff < 5) {
      this.lastPrice = price
      return
    }

    const isUp = diff > 0
    const diffText = `${isUp ? '▲' : '▼'} $${Math.round(absDiff).toLocaleString('en-US')}`

    this._spawnPopup(diffText, isUp, whaleX, whaleY)
    this.lastPrice = price

    // Update price tag color
    this.priceTag.className = isUp ? 'price-tag-up' : 'price-tag-down'
  }

  _spawnPopup(text, isUp, whaleX, whaleY) {
    const el = document.createElement('div')
    el.className = `price-popup ${isUp ? 'popup-up' : 'popup-down'}`
    el.textContent = text

    // Spawn near whale with slight random offset
    const offsetX = (Math.random() - 0.5) * 60
    el.style.left = `${whaleX + offsetX}px`
    el.style.top = `${whaleY - 20}px`

    this.container.appendChild(el)

    // Animate and remove
    requestAnimationFrame(() => {
      el.style.transform = isUp
        ? 'translateY(-70px) scale(1.1)'
        : 'translateY(70px) scale(1.1)'
      el.style.opacity = '0'
    })

    setTimeout(() => el.remove(), 900)
  }

  _injectStyles() {
    if (document.getElementById('price-popup-styles')) return
    const style = document.createElement('style')
    style.id = 'price-popup-styles'
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

      #price-tag {
        position: absolute;
        font-family: 'Orbitron', monospace;
        font-size: 13px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 20px;
        background: rgba(2, 11, 24, 0.75);
        border: 1px solid rgba(0, 200, 255, 0.3);
        color: #fff;
        backdrop-filter: blur(6px);
        transform: translate(-50%, -50%);
        transition: left 0.3s ease, top 0.3s ease, color 0.2s, border-color 0.2s;
        white-space: nowrap;
        pointer-events: none;
      }

      .price-tag-up {
        color: #00ff9d !important;
        border-color: rgba(0, 255, 157, 0.4) !important;
        text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
      }

      .price-tag-down {
        color: #ff4466 !important;
        border-color: rgba(255, 68, 102, 0.4) !important;
        text-shadow: 0 0 10px rgba(255, 68, 102, 0.5);
      }

      .price-popup {
        position: absolute;
        font-family: 'Orbitron', monospace;
        font-weight: 900;
        font-size: 15px;
        pointer-events: none;
        transform: translateY(0) scale(1);
        opacity: 1;
        transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 0.85s ease-out;
        white-space: nowrap;
        transform-origin: center;
        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
      }

      .popup-up {
        color: #00ff9d;
        filter: drop-shadow(0 0 6px rgba(0, 255, 157, 0.6));
      }

      .popup-down {
        color: #ff4466;
        filter: drop-shadow(0 0 6px rgba(255, 68, 102, 0.6));
      }
    `
    document.head.appendChild(style)
  }

  destroy() {
    this.container.remove()
  }
}