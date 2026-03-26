import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Link } from "react-router-dom";
import "./auth.css";
import { Lock, Eye, EyeClosed } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from "../store";

export function Login() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const setAuthToken = useAuthStore((state) => state.setAuthToken)
  const setUser = useAuthStore((state) => state.setUser);

  const errorMessages: Record<string, string> = {
    "User does not exist": "No account found with that email address.",
    "Invalid password": "Incorrect password. Please try again.",
  };

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        setUser(data.user);
        navigate("/dashboard");
      } else {
        const raw = data.detail || "Something went wrong. Please try again.";
        setError(errorMessages[raw] ?? raw);
      }
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // ─── PARTICLE CANVAS ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    let animId: number;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,166,35,0.35)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245,166,35,${0.07 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ─── ENTRANCE ANIMATIONS ──────────────────────────────────
  useEffect(() => {
    animate(".auth-left-content > *", {
      opacity: [0, 1],
      translateX: [-24, 0],
      duration: 700,
      ease: "easeOutExpo",
      delay: stagger(120, { start: 200 }),
    });
    animate(".auth-field, .auth-submit", {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      ease: "easeOutExpo",
      delay: stagger(80, { start: 300 }),
    });
    animate(".auth-orb", {
      scale: [1, 1.1],
      opacity: [0.6, 1],
      duration: 3000,
      ease: "easeInOutSine",
      alternate: true,
      loop: true,
    });
    animate(".auth-logo-bolt", {
      opacity: [1, 0.5],
      duration: 1800,
      ease: "easeInOutSine",
      alternate: true,
      loop: true,
    });
  }, []);

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
            <span className="auth-logo-text">Kilo</span>
          </Link>

          <div className="auth-left-tag">Peer-to-peer energy market</div>

          <h1 className="auth-left-headline">
            Your solar surplus
            <br />
            is someone's <em>power</em>.
          </h1>

          <p className="auth-left-sub">
            Sign in to your account and start trading surplus energy with
            neighbours, earning passive income from every kilowatt-hour.
          </p>

          <div className="auth-stats-row">
            <div className="auth-stat">
              <span className="auth-stat-val">1,847</span>
              <span className="auth-stat-label">Active Sellers</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-val">₦4.2M</span>
              <span className="auth-stat-label">Daily Volume</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-val">23.4T</span>
              <span className="auth-stat-label">CO₂ Avoided</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-sub">
            No account? <Link to="/register">Create one free</Link>
          </p>

          <form onSubmit={handleLogin}>
            {error && <span className="auth-error visible">{error}</span>}
            
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">@</span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  name= 'email'
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={12}/></span>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="auth-field" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <a
                  href="#"
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
