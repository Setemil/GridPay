import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { Link } from 'react-router-dom'
import './auth.css'
import { User, Lock, Eye, EyeClosed } from 'lucide-react';
import {useNavigate} from "react-router-dom"


export function Register() {
  const [showPass, setShowPass] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ─── ERROR HANDLING ─────────────────────────────────────
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [error]);

  // ─── HANDLE SUBMIT ──────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm_password = formData.get("confirm_password") as string;
    const full_name = formData.get("full_name") as string;
    const phone_number = formData.get("phone_number") as string;

    if(!email || !password || !confirm_password || !full_name || !phone_number) {
      setError("Please fill in all fields.");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        confirm_password: confirm_password,
        full_name: full_name,
        role: "User",
        phone_number: phone_number,
      }),
    });
    if (res.ok) {
      navigate("/login");
    } else {
      const data = await res.json();
      console.log(data);
      setError(data.detail || "An unknown error occurred");
    }
  }

  // ─── PARTICLE CANVAS ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    let animId: number

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W
        p.y = (p.y + p.vy + H) % H
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(245,166,35,0.35)'
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(245,166,35,${0.07 * (1 - dist / 90)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  // ─── ENTRANCE ANIMATIONS ──────────────────────────────────
  useEffect(() => {
    animate('.auth-left-content > *', {
      opacity: [0, 1],
      translateX: [-24, 0],
      duration: 700,
      ease: 'easeOutExpo',
      delay: stagger(120, { start: 200 }),
    })
    animate('.auth-field, .role-toggle, .auth-submit', {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      ease: 'easeOutExpo',
      delay: stagger(60, { start: 300 }),
    })
    animate('.auth-orb', {
      scale: [1, 1.1],
      opacity: [0.6, 1],
      duration: 3000,
      ease: 'easeInOutSine',
      alternate: true,
      loop: true,
    })
    animate('.auth-logo-bolt', {
      opacity: [1, 0.5],
      duration: 1800,
      ease: 'easeInOutSine',
      alternate: true,
      loop: true,
    })
  }, [])

  return (
    <div className="auth-root">
      {/* ─── LEFT PANEL ─────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-bg-grid" />
        <canvas ref={canvasRef} className="auth-canvas" />
        <div className="auth-orb" />

        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-bolt" />
            <span className="auth-logo-text">EnergyShare</span>
          </Link>

          <div className="auth-left-tag">Join the energy revolution</div>

          <h1 className="auth-left-headline">
            Turn your solar
            <br />
            into <em>income</em>.
          </h1>

          <p className="auth-left-sub">
            Register as a seller to list your surplus energy, or as a buyer to
            access cheaper, greener power than any generator can offer.
          </p>

          <div className="auth-stats-row">
            <div className="auth-stat">
              <span className="auth-stat-val">₦85</span>
              <span className="auth-stat-label">Per kWh (Solar)</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-val">1%</span>
              <span className="auth-stat-label">Platform Fee</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-val">49K+</span>
              <span className="auth-stat-label">kWh Traded Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-sub">
            Already have one? <Link to="/login">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {error && <span className="auth-error visible">{error}</span>}

            {/* Name */}
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <User size={16} />
                </span>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Adewale Okonkwo"
                  autoComplete="name"
                  name="full_name"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="auth-row auth-field">
              <div>
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">@</span>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    name="email"
                  />
                </div>
              </div>
              <div>
                <label className="auth-label">Phone</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon" style={{ fontSize: 11 }}>
                    +234
                  </span>
                  <input
                    className="auth-input"
                    type="tel"
                    placeholder="0801 234 5678"
                    autoComplete="tel"
                    style={{ paddingLeft: 48 }}
                    name="phone_number"
                  />
                </div>
              </div>
            </div>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Security</span>
              <div className="auth-divider-line" />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Lock size={12} />
                </span>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: 40 }}
                  name="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  {showPass ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Lock size={12} />
                </span>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  name="confirm_password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit">
              Create Account
            </button>

            <p
              style={{
                marginTop: 16,
                fontSize: 10,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                letterSpacing: "0.04em",
              }}
            >
              By registering you agree to EnergyShare's terms of service and
              consent to KYC verification via BVN or NIN as required by NERC.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
