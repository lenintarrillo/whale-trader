import * as PIXI from 'pixi.js'

export class SeaFloor {
  constructor(app, parent) {
    this.app = app
    this.container = new PIXI.Container()
    parent.addChild(this.container)

    this.scrollX = 0
    this.time = 0

    this.rocksGraphic = new PIXI.Graphics()
    this.container.addChild(this.rocksGraphic)

    this.algaeGraphic = new PIXI.Graphics()
    this.container.addChild(this.algaeGraphic)

    this.rocks = this._generateRocks()
    this.algae = this._generateAlgae()
  }

  _generateRocks() {
    const { width, height } = this.app.screen
    const rocks = []
    const count = 24
    for (let i = 0; i < count; i++) {
      rocks.push({
        x: (i / count) * width * 2.5 + Math.random() * 80,
        y: height - 20 - Math.random() * 30,
        w: 20 + Math.random() * 60,
        h: 14 + Math.random() * 30,
        color: Math.random() > 0.5 ? 0x1a3a2a : 0x0f2a1a,
        rx: 8 + Math.random() * 10,
      })
    }
    return rocks
  }

  _generateAlgae() {
    const { width, height } = this.app.screen
    const algae = []
    const count = 32
    for (let i = 0; i < count; i++) {
      const segments = 3 + Math.floor(Math.random() * 3)
      algae.push({
        x: (i / count) * width * 2.5 + Math.random() * 60,
        baseY: height - 10,
        segments,
        segmentH: 18 + Math.random() * 14,
        color: Math.random() > 0.4 ? 0x1a7a3a : 0x0f5a2a,
        darkColor: Math.random() > 0.4 ? 0x0f5a2a : 0x083a1a,
        width: 5 + Math.random() * 7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        amplitude: 4 + Math.random() * 6,
      })
    }
    return algae
  }

  update(delta) {
    this.time += delta * 0.04
    this.scrollX += delta * 0.8

    const { width } = this.app.screen
    const wrap = width * 2.5

    const g = this.rocksGraphic
    g.clear()

    this.rocks.forEach(rock => {
      const x = ((rock.x - this.scrollX) % wrap + wrap) % wrap - 60
      g.beginFill(rock.color)
      g.drawRoundedRect(x - rock.w / 2, rock.y - rock.h, rock.w, rock.h, rock.rx)
      g.endFill()
      g.beginFill(0x2a5a3a, 0.3)
      g.drawRoundedRect(x - rock.w * 0.3, rock.y - rock.h + 3, rock.w * 0.4, rock.h * 0.35, 4)
      g.endFill()
    })

    const ag = this.algaeGraphic
    ag.clear()

    this.algae.forEach(alg => {
      const x = ((alg.x - this.scrollX * 0.9) % wrap + wrap) % wrap - 60
      let prevX = x
      let prevY = alg.baseY

      for (let s = 0; s < alg.segments; s++) {
        const sway = Math.sin(this.time * alg.speed + alg.phase + s * 0.5) * alg.amplitude
        const swayAmp = (s + 1) / alg.segments
        const nx = x + sway * swayAmp
        const ny = alg.baseY - (s + 1) * alg.segmentH
        const w = alg.width * (1 - s * 0.2)

        ag.beginFill(s % 2 === 0 ? alg.color : alg.darkColor)
        ag.drawPolygon([
          prevX - w / 2, prevY,
          prevX + w / 2, prevY,
          nx + w / 2, ny,
          nx - w / 2, ny,
        ])
        ag.endFill()

        prevX = nx
        prevY = ny
      }

      ag.beginFill(alg.color)
      ag.drawCircle(prevX, prevY, alg.width * 0.5)
      ag.endFill()
    })
  }
}