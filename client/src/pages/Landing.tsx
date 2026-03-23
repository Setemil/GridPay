import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { useNavigate } from 'react-router-dom'
import './landing.css'

// ─── TICKER DATA ──────────────────────────────────────────
const TICKER_ITEMS = [
  { label: 'SOLAR/kWh', price: '₦85.00', change: '+2.3%', up: true },
  { label: 'WIND/kWh', price: '₦72.50', change: '+1.1%', up: true },
  { label: 'BATTERY/kWh', price: '₦91.20', change: '-0.8%', up: false },
  { label: 'DAILY VOL', price: '₦4.2M', change: '+18.4%', up: true },
  { label: 'ACTIVE SELLERS', price: '1,847', change: '+34', up: true },
  { label: 'TOTAL kWh TODAY', price: '49,320', change: '+5.2%', up: true },
  { label: 'CO₂ AVOIDED', price: '23.4T', change: '+3.1%', up: true },
  { label: 'SOLAR/kWh', price: '₦85.00', change: '+2.3%', up: true },
  { label: 'WIND/kWh', price: '₦72.50', change: '+1.1%', up: true },
]

const STEPS = [
  {
    num: '01',
    icon: '⚡',
    title: 'Connect Your Meter',
    body: 'Install a smart meter on your solar panel array. It reads surplus kWh in real time and publishes it live to the marketplace.',
  },
  {
    num: '02',
    icon: '📋',
    title: 'List Your Surplus',
    body: 'Set your price per kWh, maximum available units, and auto-approval rules. Your listing goes live in under 60 seconds.',
  },
  {
    num: '03',
    icon: '💳',
    title: 'Buyer Pays via Interswitch',
    body: 'Interswitch Webpay handles card payments and wallets. Once confirmed, energy flows and settlement happens in seconds.',
  },
  {
    num: '04',
    icon: '📈',
    title: 'Earn Passive Income',
    body: 'Receive 99% of every sale directly to your wallet. The blockchain layer logs every joule for immutable record-keeping.',
  },
]

const STATS = [
  { value: 49320, suffix: ' kWh', label: 'Traded Today' },
  { value: 1847, suffix: '', label: 'Active Sellers' },
  { value: 4.2, suffix: 'M', prefix: '₦', label: 'Daily Volume' },
  { value: 23.4, suffix: 'T', label: 'CO₂ Avoided' },
]

const FEATURES = [
  {
    icon: '⚡',
    color: 'amber',
    title: 'Peer-to-Peer Trading',
    body: 'Sell surplus solar directly to your neighbors. No middleman, no bureaucracy — just clean energy and instant cash.',
  },
  {
    icon: '🏦',
    color: 'green',
    title: 'Interswitch Payments',
    body: 'Webpay, Quickteller, USSD — every naira moves on CBN-licensed rails. Instant settlement, zero reconciliation.',
  },
  {
    icon: '🔗',
    color: 'blue',
    title: 'Blockchain Ledger',
    body: 'Every transaction is immutably logged. NERC-compliant audit trails. Carbon credits unlocked automatically.',
  },
  {
    icon: '📱',
    color: 'amber',
    title: 'USSD Accessible',
    body: 'No smartphone required for sellers. Receive payments, check balance, and list energy via any basic phone.',
  },
  {
    icon: '🔌',
    color: 'green',
    title: 'Smart Meter Integration',
    body: 'Live kWh readings update every few minutes. The market knows exactly what\'s available before a buyer even clicks.',
  },
  {
    icon: '🌍',
    color: 'blue',
    title: 'Carbon Credits',
    body: 'Every kWh of solar sold instead of diesel gets logged on-chain. Sell verified carbon offsets to ESG-focused corporations.',
  },
]

const TX_STEPS = [
  { label: 'Smart meter detects 48 kWh surplus', icon: '🔋' },
  { label: 'Listing published at ₦85/kWh', icon: '📋' },
  { label: 'Buyer selects 20 kWh → ₦1,717 total', icon: '🛒' },
  { label: 'Interswitch OTP verification', icon: '🔐' },
  { label: 'Energy flows through shared grid', icon: '⚡' },
  { label: '₦1,700 settled to seller wallet', icon: '✅' },
]

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const txRef = useRef<HTMLDivElement>(null)
  const statsAnimatedRef = useRef(false)
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  // ─── HERO ANIMATIONS ──────────────────────────────────────
  useEffect(() => {
    animate('.hero-eyebrow', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      ease: 'easeOutExpo',
      delay: 200,
    })
    animate('.hero-title span', {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 900,
      ease: 'easeOutExpo',
      delay: stagger(120, { start: 400 }),
    })
    animate('.hero-sub', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      ease: 'easeOutExpo',
      delay: 900,
    })
    animate('.hero-ctas', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      ease: 'easeOutExpo',
      delay: 1100,
    })
    animate('.hero-visual', {
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 1000,
      ease: 'easeOutExpo',
      delay: 600,
    })

    // Energy orb glow pulse
    animate('.energy-orb', {
      scale: [1, 1.08],
      opacity: [0.7, 1],
      duration: 2400,
      ease: 'easeInOutSine',
      alternate: true,
      loop: true,
    })

    // Flow dots
    animate('.flow-dot-anim', {
      translateX: ['0%', '100%'],
      opacity: [0, 1, 1, 0],
      duration: 2000,
      ease: 'linear',
      delay: stagger(600),
      loop: true,
    })
  }, [])

  // ─── PARTICLE CANVAS ──────────────────────────────────────
  useEffect(() => {
    const canvas = particlesRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let W = (canvas.width = canvas.offsetWidth)
    let H = (canvas.height = canvas.offsetHeight)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,166,35,${p.a * 0.6})`
        ctx.fill()
      })
      // Connect nearby
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(245,166,35,${0.06 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // ─── SCROLL OBSERVER ──────────────────────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    const observe = (ref: React.RefObject<HTMLDivElement | null>, fn: () => void) => {
      if (!ref.current) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            fn()
            obs.disconnect()
          }
        },
        { threshold: 0.15 }
      )
      obs.observe(ref.current)
      observers.push(obs)
    }

    // Stats count-up (RAF-based, no animejs plain-object quirks)
    observe(statsRef, () => {
      if (statsAnimatedRef.current) return
      statsAnimatedRef.current = true
      STATS.forEach((s, i) => {
        const el = document.querySelector(`.stat-num-${i}`)
        if (!el) return
        const duration = 1800
        const startTime = performance.now() + i * 150
        const tick = (now: number) => {
          if (now < startTime) { requestAnimationFrame(tick); return }
          const t = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 4)
          const v = eased * s.value
          el.textContent = (s.prefix || '') + (Number.isInteger(s.value) ? Math.round(v).toLocaleString() : v.toFixed(1)) + s.suffix
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      animate('.stat-card', {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
        ease: 'easeOutExpo',
        delay: stagger(120),
      })
    })

    // Steps
    observe(stepsRef, () => {
      animate('.step-card', {
        opacity: [0, 1],
        translateX: [-30, 0],
        duration: 700,
        ease: 'easeOutExpo',
        delay: stagger(180),
      })
    })

    // Features
    observe(featuresRef, () => {
      animate('.feature-card', {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        duration: 700,
        ease: 'easeOutExpo',
        delay: stagger(100),
      })
    })

    // Tx steps
    observe(txRef, () => {
      animate('.tx-step', {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 500,
        ease: 'easeOutExpo',
        delay: stagger(160),
      })
      animate('.tx-line', {
        scaleY: [0, 1],
        duration: 900,
        ease: 'easeInOutExpo',
        delay: 300,
      })
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <div className="land-root">
      {/* BG GRID */}
      <div className="bg-grid" />

      {/* ─── NAV ──────────────────────────────────────────────── */}
      <nav className="land-nav">
        <div className="nav-logo">
          <span className="logo-bolt">⚡</span>
          <span className="logo-text">EnergyShare</span>
        </div>
        <div className="nav-links">
          <a href="#how">How It Works</a>
          <a href="#features">Features</a>
          <a href="#transaction">Transaction</a>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── LIVE TICKER ─────────────────────────────────────── */}
      <div className="ticker-wrap">
        <span className="ticker-live"><span className="live-dot" />LIVE</span>
        <div className="ticker-track">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} className="ticker-item">
                <span className="ti-label">{t.label}</span>
                <span className="ti-price">{t.price}</span>
                <span className={`ti-change ${t.up ? 'up' : 'down'}`}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <canvas className="particles-canvas" ref={particlesRef} />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-badge">PEER-TO-PEER ENERGY TRADING</span>
            <span className="eyebrow-sep">◆</span>
            <span className="eyebrow-sub">Powered by Interswitch · Built on Blockchain</span>
          </div>

          <h1 className="hero-title">
            <span>Trade</span>
            <span className="amber-word"> Electricity</span>
            <span className="break"> </span>
            <span>Like</span>
            <span className="amber-word"> Stocks.</span>
          </h1>

          <p className="hero-sub">
            Your solar panels generate surplus power. Your neighbor needs it.
            EnergyShare connects them — settling every trade in seconds via
            Interswitch while logging every joule on-chain.
          </p>

          <div className="hero-ctas">
            <button className="btn-primary btn-lg" onClick={() => navigate("/register")}>
              <span>Start Selling Energy</span>
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-outline btn-lg" onClick={() => navigate("/browse")}>
              <span>Browse Listings</span>
            </button>
          </div>

          <div className="hero-trust">
            <span className="trust-item"><span className="t-dot green" />CBN-Licensed Payments</span>
            <span className="trust-item"><span className="t-dot amber" />NERC Compliant</span>
            <span className="trust-item"><span className="t-dot blue" />Blockchain Verified</span>
          </div>
        </div>

        {/* Hero Visual — Energy Node Diagram */}
        <div className="hero-visual">
          <div className="visual-card">
            <div className="vc-header">
              <span className="vc-dot" /><span className="vc-dot" /><span className="vc-dot" />
              <span className="vc-title">LIVE MARKETPLACE</span>
            </div>

            <div className="energy-orb-wrap">
              <div className="energy-orb" />
              <div className="orb-ring r1" />
              <div className="orb-ring r2" />
              <div className="orb-ring r3" />
              <span className="orb-label">48 kWh<br /><small>available</small></span>
            </div>

            <div className="vc-nodes">
              <div className="vnode seller">
                <span className="vnode-icon">🏠</span>
                <span className="vnode-label">SELLER<br /><small>Lagos</small></span>
              </div>
              <div className="vnode-flow">
                <div className="flow-track">
                  <div className="flow-dot-anim" />
                </div>
                <span className="flow-kwh">⚡ 20 kWh</span>
              </div>
              <div className="vnode buyer">
                <span className="vnode-icon">🏢</span>
                <span className="vnode-label">BUYER<br /><small>Ikeja</small></span>
              </div>
            </div>

            <div className="vc-stats">
              <div className="vcs-item">
                <span className="vcs-val">₦85</span>
                <span className="vcs-label">Per kWh</span>
              </div>
              <div className="vcs-divider" />
              <div className="vcs-item">
                <span className="vcs-val green-text">₦1,700</span>
                <span className="vcs-label">Settlement</span>
              </div>
              <div className="vcs-divider" />
              <div className="vcs-item">
                <span className="vcs-val">3.2s</span>
                <span className="vcs-label">Avg. Time</span>
              </div>
            </div>

            <div className="vc-powered">
              <span>Settled by</span>
              <span className="interswitch-badge">INTERSWITCH</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────── */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-num stat-num-${i}`}>
                {s.prefix || ''}{Number.isInteger(s.value) ? s.value.toLocaleString() : s.value.toFixed(1)}{s.suffix}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-bar"><div className="stat-bar-fill" /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section className="steps-section" id="how" ref={stepsRef}>
        <div className="section-label">◆ HOW IT WORKS</div>
        <h2 className="section-title">From Panel to Payment<br /><span className="amber-word">in Four Steps</span></h2>
        <p className="section-sub">EnergyShare handles everything between surplus energy and settled cash — you just set your price.</p>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
              {i < STEPS.length - 1 && <div className="connector-line" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── USER TYPES ──────────────────────────────────────── */}
      <section className="users-section">
        <div className="section-label">◆ WHO IS IT FOR</div>
        <h2 className="section-title">Two Sides of the<br /><span className="amber-word">Energy Economy</span></h2>

        <div className="users-grid">
          {/* Seller */}
          <div className="user-card seller-card">
            <div className="user-badge badge-solar">ENERGY SELLER</div>
            <div className="user-icon">☀️</div>
            <h3>You Have Solar Panels</h3>
            <p>Turn your idle surplus into passive income. Every kWh you generate beyond your own use can be listed on the marketplace and sold to neighbors in real time.</p>
            <ul className="user-perks">
              <li><span className="perk-dot amber-dot" />Solar, wind, or battery storage</li>
              <li><span className="perk-dot amber-dot" />Smart meter auto-lists surplus</li>
              <li><span className="perk-dot amber-dot" />99% of every sale direct to wallet</li>
              <li><span className="perk-dot amber-dot" />USSD supported — no smartphone needed</li>
            </ul>
            <button className="btn-primary btn-full">List My Energy</button>
          </div>

          {/* Buyer */}
          <div className="user-card buyer-card">
            <div className="user-badge badge-wind">ENERGY BUYER</div>
            <div className="user-icon">⚡</div>
            <h3>You Need Power</h3>
            <p>Browse local listings and buy clean solar energy for cheaper than a diesel generator. Pre-load your wallet once and buy instantly every time — no card entry needed.</p>
            <ul className="user-perks">
              <li><span className="perk-dot green-dot" />Browse local solar listings</li>
              <li><span className="perk-dot green-dot" />Interswitch Quickteller wallet top-up</li>
              <li><span className="perk-dot green-dot" />Cheaper and greener than diesel</li>
              <li><span className="perk-dot green-dot" />Instant delivery via shared grid</li>
            </ul>
            <button className="btn-outline btn-full">Find Listings</button>
          </div>
        </div>

        <div className="prosumer-note">
          <span className="pn-icon">💡</span>
          <span>One user can be <strong>both simultaneously</strong> — buying wind power in the morning while selling solar surplus in the afternoon.</span>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────── */}
      <section className="features-section" id="features" ref={featuresRef}>
        <div className="section-label">◆ TECHNOLOGY</div>
        <h2 className="section-title">Built on Infrastructure<br /><span className="amber-word">That Actually Works</span></h2>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className={`feature-card fc-${f.color}`} key={i}>
              <div className="fc-icon">{f.icon}</div>
              <h3 className="fc-title">{f.title}</h3>
              <p className="fc-body">{f.body}</p>
              <div className="fc-line" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRANSACTION FLOW ────────────────────────────────── */}
      <section className="tx-section" id="transaction" ref={txRef}>
        <div className="section-label">◆ TRANSACTION FLOW</div>
        <h2 className="section-title">20 kWh, ₦1,700,<br /><span className="amber-word">Settled in Seconds</span></h2>
        <p className="section-sub">Here is exactly what happens from the moment a buyer clicks "Buy" to when the seller's wallet is credited.</p>

        <div className="tx-flow">
          <div className="tx-line" />
          {TX_STEPS.map((t, i) => (
            <div className="tx-step" key={i}>
              <div className="tx-circle">
                <span className="tx-step-icon">{t.icon}</span>
                <span className="tx-step-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="tx-content">
                <span className="tx-step-label">{t.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="tx-footer">
          <div className="txf-item">
            <span className="txf-label">PLATFORM FEE</span>
            <span className="txf-val amber">1%</span>
          </div>
          <div className="txf-sep">·</div>
          <div className="txf-item">
            <span className="txf-label">SELLER RECEIVES</span>
            <span className="txf-val green-text">99%</span>
          </div>
          <div className="txf-sep">·</div>
          <div className="txf-item">
            <span className="txf-label">SETTLEMENT TIME</span>
            <span className="txf-val">~3 SEC</span>
          </div>
          <div className="txf-sep">·</div>
          <div className="txf-item">
            <span className="txf-label">PROCESSOR</span>
            <span className="txf-val interswitch-text">INTERSWITCH</span>
          </div>
        </div>
      </section>

      {/* ─── IMPACT ──────────────────────────────────────────── */}
      <section className="impact-section">
        <div className="impact-inner">
          <div className="impact-label">◆ THE BIGGER PICTURE</div>
          <h2 className="impact-title">Nigeria Loses<br /><span className="amber-word">$29B Annually</span><br />to Inadequate Power</h2>
          <p className="impact-body">
            EnergyShare doesn't try to fix the national grid — it <strong>routes around it</strong>. By turning every solar panel owner into a micro-utility and every Interswitch wallet into an energy account, we create a decentralized power economy that functions independently of EKEDC infrastructure.
          </p>
          <div className="impact-stats">
            <div className="imp-stat">
              <span className="imp-val">1 LGA</span>
              <span className="imp-lbl">at a time</span>
            </div>
            <div className="imp-stat">
              <span className="imp-val">∞</span>
              <span className="imp-lbl">prosumer nodes</span>
            </div>
            <div className="imp-stat">
              <span className="imp-val">0</span>
              <span className="imp-lbl">EKEDC required</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-content">
          <div className="cta-eyebrow">◆ JOIN THE GRID</div>
          <h2 className="cta-title">Start Trading<br /><span className="amber-word">Energy Today</span></h2>
          <p className="cta-sub">Register in under 2 minutes. KYC via BVN or NIN. Smart meter connection guide included.</p>
          <div className="cta-actions">
            <button className="btn-primary btn-xl" onClick={() => navigate("/register")}>
              <span>Create Free Account</span>
              <span className="btn-arrow">→</span>
            </button>
            <div className="cta-trust">
              <span>🔒 CBN-licensed payments</span>
              <span>⚡ NERC-compliant</span>
              <span>🔗 Blockchain-verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="land-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="logo-bolt">⚡</span>
              <span className="logo-text">EnergyShare</span>
            </div>
            <p>Peer-to-peer electricity trading for Nigeria. Powered by Interswitch. Built on the blockchain.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <div className="fc-head">Platform</div>
              <a href="#">Marketplace</a>
              <a href="#">Smart Meters</a>
              <a href="#">Wallet</a>
              <a href="#">Carbon Credits</a>
            </div>
            <div className="footer-col">
              <div className="fc-head">Compliance</div>
              <a href="#">NERC License</a>
              <a href="#">Interswitch CBN</a>
              <a href="#">KYC Policy</a>
              <a href="#">Terms of Use</a>
            </div>
            <div className="footer-col">
              <div className="fc-head">Developers</div>
              <a href="#">API Docs</a>
              <a href="#">Smart Meter SDK</a>
              <a href="#">Webhook Events</a>
              <a href="#">Status Page</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EnergyShare. All rights reserved.</span>
          <span className="footer-tech">Built with Interswitch · NERC Compliant · Blockchain Verified</span>
        </div>
      </footer>
    </div>
  )
}
