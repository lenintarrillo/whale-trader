export const Analytics = {
  // Track page view (automático con GA4)
  
  // Usuario abre posición
  openPosition(type, leverage, amount) {
    gtag('event', 'open_position', {
      position_type: type,
      leverage: leverage,
      amount: amount,
    })
  },

  // Usuario cierra posición con ganancia
  closeWin(pnl, leverage) {
    gtag('event', 'close_win', {
      pnl: Math.round(pnl),
      leverage: leverage,
    })
  },

  // Usuario cierra posición con pérdida
  closeLoss(pnl, leverage) {
    gtag('event', 'close_loss', {
      pnl: Math.round(pnl),
      leverage: leverage,
    })
  },

  // Ballena liquidada
  liquidated(leverage, amount) {
    gtag('event', 'liquidated', {
      leverage: leverage,
      amount: amount,
    })
  },

  // Usuario visita el perfil
  viewProfile() {
    gtag('event', 'view_profile')
  },
}