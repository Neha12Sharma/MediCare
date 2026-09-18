// src/pages/LandingPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

/* Animated counter hook */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const SERVICES = [
  { icon: "🫀", title: "Cardiology & Heart Institute", desc: "Advanced cardiac imaging, interventional cardiology, and heart failure management by board-certified specialists.", color: "#fef2f2", border: "#fecaca", iconBg: "#fee2e2" },
  { icon: "🧠", title: "Neurology & Neurosurgery", desc: "Comprehensive care for brain and spine conditions, epilepsy, stroke, and complex neurological disorders.", color: "#f0fdf4", border: "#bbf7d0", iconBg: "#dcfce7" },
  { icon: "🩺", title: "Dermatology & Trichology", desc: "Medical and cosmetic dermatology, skin cancer screening, hair restoration, and advanced aesthetic treatments.", color: "#fdf4ff", border: "#e9d5ff", iconBg: "#f3e8ff" },
  { icon: "👶", title: "Pediatrics & Child Health", desc: "Holistic child healthcare from newborns through adolescence, including vaccinations and developmental monitoring.", color: "#fffbeb", border: "#fde68a", iconBg: "#fef3c7" },
  { icon: "🦴", title: "Orthopedics & Joint Replacement", desc: "Robotic-assisted joint replacement, sports medicine, fracture care, and spine surgery with rapid recovery protocols.", color: "#f0f9ff", border: "#bae6fd", iconBg: "#e0f2fe" },
  { icon: "🚨", title: "24/7 Emergency & Trauma", desc: "Level-1 trauma center with immediate triage, emergency surgery suites, and critical care units around the clock.", color: "#fff1f2", border: "#fecdd3", iconBg: "#ffe4e6" },
];

const STEPS = [
  { num: "01", icon: "👤", title: "Create Your Profile", desc: "Register as a patient in under 2 minutes. Your secure health profile is HIPAA-compliant and always private." },
  { num: "02", icon: "📅", title: "Book an Appointment", desc: "Browse verified specialist doctors, check real-time availability, and book instantly from your dashboard." },
  { num: "03", icon: "🩺", title: "Receive Expert Care", desc: "Attend your consultation, access digital prescriptions, lab results, and follow-up care - all in one place." },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Patient", text: "Booking my cardiology appointment was effortless. The digital prescription feature saved me so much time at the pharmacy.", avatar: "👩" },
  { name: "Dr. Raj K.", role: "Cardiologist", text: "The doctor portal gives me a complete view of my patients histories and upcoming appointments. Truly professional.", avatar: "👨‍⚕️" },
  { name: "Priya L.", role: "Patient", text: "I could track my lab reports in real-time. MediCare+ made a stressful situation feel completely manageable.", avatar: "👩‍💼" },
];

const ServiceCard = ({ icon, title, desc, color, border, iconBg, onBook }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? color : "#ffffff",
        border: "1px solid " + (hovered ? border : "#e2e8f0"),
        borderRadius: "20px", padding: "2rem 1.75rem", cursor: "default",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}
    >
      <div>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", marginBottom: "1.25rem" }}>
          {icon}
        </div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.6rem", lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.7, margin: "0 0 1.25rem 0" }}>{desc}</p>
      </div>
      <button
        onClick={onBook}
        style={{
          background: "transparent",
          border: "1.5px solid " + (hovered ? "#0284c7" : "#cbd5e1"),
          color: "#0284c7",
          padding: "0.6rem 1rem",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem"
        }}
      >
        📅 Book Appointment →
      </button>
    </div>
  );
};

const StepCard = ({ num, icon, title, desc, isLast, onBook }) => (
  <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg, #0284c7, #0369a1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", boxShadow: "0 8px 20px rgba(2,132,199,0.3)" }}>
        {icon}
      </div>
      {!isLast && <div style={{ width: "2px", height: "60px", background: "linear-gradient(#0284c7, transparent)", marginTop: "0.5rem" }} />}
    </div>
    <div style={{ paddingTop: "0.75rem", paddingBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>Step {num}</div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.7, margin: "0 0 0.75rem 0" }}>{desc}</p>
      {num === "02" && (
        <button
          onClick={onBook}
          style={{
            background: "#0284c7",
            color: "#ffffff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          📅 Book Appointment Now
        </button>
      )}
    </div>
  </div>
);

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Cardiology");
  const [selectedDoctor, setSelectedDoctor] = useState("Any Available Specialist");
  const [bookingDate, setBookingDate] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleBookAppointment = () => {
    if (!selectedSpecialty || !bookingDate || !selectedDoctor) {
      setValidationError("⚠️ Please select Preferred Date, Specialty, and Doctor Preference before booking!");
      return;
    }
    setValidationError("");
    navigate("/register", {
      state: {
        specialty: selectedSpecialty,
        date: bookingDate,
        doctor: selectedDoctor,
        fromBooking: true
      }
    });
  };

  const userPortalPath = user
    ? user.role === "patient"
      ? "/patient"
      : user.role === "doctor"
      ? "/doctor"
      : "/admin"
    : "/register";

  const patients = useCounter(48500, 2200);
  const doctors = useCounter(320, 2000);
  const years = useCounter(25, 1500);
  const satisfaction = useCounter(98, 1800);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <PublicNavbar />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #0284c7 100%)", position: "relative", overflow: "hidden", padding: "5rem 1.5rem 7rem" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "950px", margin: "0 auto", textAlign: "center", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.4rem 1rem", borderRadius: "30px", fontSize: "0.8rem", fontWeight: 700, color: "#bae6fd", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.75rem" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            JCI Accredited • HIPAA Compliant • ISO 9001:2015
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
            World-Class Healthcare,<br /><span style={{ color: "#7dd3fc" }}>All in One Portal</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#bae6fd", lineHeight: 1.75, maxWidth: "680px", margin: "0 auto 2.5rem" }}>
            Book specialist appointments, access your digital health records, receive prescriptions, and connect with verified doctors - securely and instantly.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            <button
              onClick={handleBookAppointment}
              style={{
                padding: "1rem 2.25rem",
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "1.05rem",
                background: "#ffffff",
                color: "#0369a1",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                transition: "all 0.2s ease"
              }}
            >
              📅 Book Appointment →
            </button>
            <Link to={userPortalPath} style={{ padding: "1rem 2rem", borderRadius: "14px", fontWeight: 700, fontSize: "1rem", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              {user ? `👤 Go to My Portal (${user.role})` : "📝 Register Account"}
            </Link>
          </div>

          {/* Quick Appointment Booking Widget on General Dashboard */}
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "1.75rem 2rem",
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            textAlign: "left",
            maxWidth: "900px",
            margin: "0 auto",
            border: "1px solid rgba(255,255,255,0.6)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.4rem" }}>🩺</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Quick Book Appointment
              </h3>
              <span style={{ marginLeft: "auto", fontSize: "0.75rem", background: "#e0f2fe", color: "#0369a1", padding: "0.25rem 0.65rem", borderRadius: "20px", fontWeight: 700 }}>Instant Access</span>
            </div>

            {validationError && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.875rem",
                fontWeight: 700,
                marginBottom: "1rem"
              }}>
                {validationError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Specialty / Department *</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => { setSelectedSpecialty(e.target.value); setValidationError(""); }}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc", outline: "none" }}
                >
                  <option value="Cardiology">🫀 Cardiology</option>
                  <option value="Neurology">🧠 Neurology</option>
                  <option value="Dermatology">🩺 Dermatology</option>
                  <option value="Pediatrics">👶 Pediatrics</option>
                  <option value="Orthopedics">🦴 Orthopedics</option>
                  <option value="Emergency">🚨 General Medicine</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Preferred Date *</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => { setBookingDate(e.target.value); setValidationError(""); }}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Doctor Preference *</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => { setSelectedDoctor(e.target.value); setValidationError(""); }}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc", outline: "none" }}
                >
                  <option value="Any Available Specialist">Any Available Specialist</option>
                  <option value="Senior Consultant">Senior Consultant</option>
                  <option value="Chief Physician">Chief Physician</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleBookAppointment}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1.25rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  📅 Book Appointment
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2.5rem" }}>
            {["🏥 JCI Accredited", "🛡️ HIPAA Compliant", "⭐ ISO 9001:2015", "🏆 25+ Years of Care"].map(badge => (
              <span key={badge} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.3rem 0.85rem", borderRadius: "20px", fontSize: "0.78rem", color: "#e0f2fe", fontWeight: 600 }}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { value: patients.toLocaleString() + "+", label: "Patients Served", icon: "👨‍👩‍👧‍👦", color: "#0284c7" },
            { value: doctors + "+", label: "Specialist Doctors", icon: "👨‍⚕️", color: "#7c3aed" },
            { value: years + " Yrs", label: "Years of Excellence", icon: "🏆", color: "#059669" },
            { value: satisfaction + "%", label: "Patient Satisfaction", icon: "⭐", color: "#d97706" },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: stat.color, lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 600, marginTop: "0.35rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Clinical Centers of Excellence</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, color: "#0f172a", marginBottom: "1rem" }}>Specialties We Cover</h2>
            <p style={{ fontSize: "1rem", color: "#64748b", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>Our hospital brings together the best specialists across 30+ medical disciplines, all accessible through a single unified health platform.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {SERVICES.map(s => <ServiceCard key={s.title} {...s} onBook={handleBookAppointment} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "5rem 1.5rem", background: "#ffffff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Simple Process</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, color: "#0f172a", marginBottom: "2.5rem", lineHeight: 1.2 }}>Your Health Journey<br />in 3 Simple Steps</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {STEPS.map((s, i) => <StepCard key={s.num} {...s} isLast={i === STEPS.length - 1} onBook={handleBookAppointment} />)}
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #0369a1, #0c4a6e)", borderRadius: "28px", padding: "3rem 2.5rem", color: "#ffffff", boxShadow: "0 24px 60px rgba(3,105,161,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🩺</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem", color: "#ffffff" }}>Why Choose MediCare+?</h3>
              <p style={{ color: "#bae6fd", lineHeight: 1.7, fontSize: "0.9rem" }}>We combine clinical expertise with cutting-edge digital infrastructure so your health is always in expert hands.</p>
            </div>
            {["✔ Real-time appointment booking", "✔ Digital prescriptions & e-lab reports", "✔ Secure HIPAA-compliant health records", "✔ 24/7 emergency & teleconsultation", "✔ Multi-role access: patient, doctor & admin"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem", fontSize: "0.9rem", color: "#e0f2fe", fontWeight: 500 }}>{item}</div>
            ))}
            <button onClick={handleBookAppointment} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", padding: "0.85rem 1.75rem", borderRadius: "12px", background: "#ffffff", color: "#0369a1", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              📅 Book Appointment Now →
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Patient & Doctor Stories</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, color: "#0f172a" }}>Trusted by Thousands</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "1.5rem", color: "#fbbf24", marginBottom: "1rem" }}>⭐⭐⭐⭐⭐</div>
                <p style={{ color: "#475569", lineHeight: 1.75, fontSize: "0.925rem", marginBottom: "1.5rem", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{t.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ background: "linear-gradient(135deg, #0c4a6e, #0369a1)", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", fontWeight: 900, color: "#ffffff", marginBottom: "1rem", lineHeight: 1.2 }}>Your Health Deserves the Best</h2>
          <p style={{ color: "#bae6fd", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>Join over 48,000 patients who trust MediCare+ for their healthcare needs. Book an appointment today - it is free, secure, and takes less than 2 minutes.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={handleBookAppointment} style={{ padding: "1rem 2.25rem", borderRadius: "12px", fontWeight: 800, fontSize: "1rem", background: "#ffffff", color: "#0369a1", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              📅 Book Appointment →
            </button>
            <Link to={userPortalPath} style={{ padding: "1rem 2.25rem", borderRadius: "12px", fontWeight: 700, fontSize: "1rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              {user ? `👤 Go to My Portal (${user.role})` : "🔑 Already a Member? Sign In"}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
