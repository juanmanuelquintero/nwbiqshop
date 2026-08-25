import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerUsuario,
  TraerTienda,
  ModificarUsuario,
  ModificarTienda,
  CambiarContrasena,
} from "../api/axios";
import "../styles/opciones.css";

const VERSION = "1.0.0";
const CONTACTO = {
  email: "soporte@nwbiqshop.com",
  whatsapp: "+57 300 000 0000",
  web: "https://nwbiqshop.com",
};

/* ══════════════════════════════════════════
   Sección colapsable
══════════════════════════════════════════ */
function SeccionCard({ icon, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`op-section ${open ? "op-section--open" : ""}`}>
      <button className="op-section__header" onClick={() => setOpen((v) => !v)}>
        <div className="op-section__header-left">
          <span className="op-section__icon">{icon}</span>
          <span className="op-section__title">{title}</span>
          {badge && <span className="op-section__badge">{badge}</span>}
        </div>
        <span className="op-section__arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="op-section__body">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   Formulario datos usuario
══════════════════════════════════════════ */
function FormUsuario({ usuario, cedula, onGuardado }) {
  const [form, setForm] = useState({
    nombres:         usuario?.nombres       ?? "",
    apellidos:       usuario?.apellidos     ?? "",
    ciudad:          usuario?.ciudad        ?? "",
    direccion:       usuario?.direccion     ?? "",
    correo:          usuario?.correo        ?? "",
    telefono:        usuario?.telefono      ?? "",
    fecha_nacimieno: usuario?.fecha_nacimieno ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ModificarUsuario({ id_usuario: cedula, ...form });
      mostrarAlerta("success", "Datos actualizados correctamente");
      onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="op-form" onSubmit={handleSubmit}>
      <div className="op-form__grid">
        <div className="op-field">
          <label>Nombres</label>
          <input value={form.nombres} onChange={(e) => set("nombres", e.target.value)} placeholder="Juan Esteban" />
        </div>
        <div className="op-field">
          <label>Apellidos</label>
          <input value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} placeholder="García Pérez" />
        </div>
        <div className="op-field">
          <label>Correo</label>
          <input type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)} placeholder="correo@ejemplo.com" />
        </div>
        <div className="op-field">
          <label>Teléfono</label>
          <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="3001234567" />
        </div>
        <div className="op-field">
          <label>Ciudad</label>
          <input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Armenia" />
        </div>
        <div className="op-field">
          <label>Dirección</label>
          <input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle 21 #17-9" />
        </div>
        <div className="op-field">
          <label>Fecha de nacimiento</label>
          <input type="date" value={form.fecha_nacimieno} onChange={(e) => set("fecha_nacimieno", e.target.value)} />
        </div>
      </div>
      <button type="submit" className="op-btn op-btn--primary" disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios ✓"}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════
   Formulario cambiar contraseña
══════════════════════════════════════════ */
function FormContrasena({ cedula }) {
  const [actual, setActual]   = useState("");
  const [nueva, setNueva]     = useState("");
  const [repite, setRepite]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva,  setShowNueva]  = useState(false);

  const fortaleza = (() => {
    if (nueva.length === 0) return null;
    if (nueva.length < 6)   return { label: "Débil",   cls: "op-strength--weak" };
    if (nueva.length < 10)  return { label: "Media",   cls: "op-strength--medium" };
    return                         { label: "Fuerte",  cls: "op-strength--strong" };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nueva !== repite) {
      mostrarAlerta("error", "Las contraseñas nuevas no coinciden");
      return;
    }
    if (nueva.length < 8 || nueva.length > 15) {
      mostrarAlerta("error", "La contraseña debe tener entre 8 y 15 caracteres");
      return;
    }
    setSaving(true);
    try {
      await CambiarContrasena({ id_usuario: cedula, contraseña: actual, contraseñanueva: nueva });
      mostrarAlerta("success", "Contraseña actualizada correctamente");
      setActual(""); setNueva(""); setRepite("");
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="op-form" onSubmit={handleSubmit}>
      <div className="op-form__grid op-form__grid--single">
        <div className="op-field">
          <label>Contraseña actual</label>
          <div className="op-input-eye">
            <input
              type={showActual ? "text" : "password"}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="button" className="op-eye-btn" onClick={() => setShowActual((v) => !v)}>
              {showActual ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <div className="op-field">
          <label>Nueva contraseña <span className="op-hint">(8–15 caracteres)</span></label>
          <div className="op-input-eye">
            <input
              type={showNueva ? "text" : "password"}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="button" className="op-eye-btn" onClick={() => setShowNueva((v) => !v)}>
              {showNueva ? "🙈" : "👁️"}
            </button>
          </div>
          {fortaleza && (
            <div className={`op-strength ${fortaleza.cls}`}>
              <div className="op-strength__bar" />
              <span>{fortaleza.label}</span>
            </div>
          )}
        </div>
        <div className="op-field">
          <label>Repetir nueva contraseña</label>
          <input
            type="password"
            value={repite}
            onChange={(e) => setRepite(e.target.value)}
            placeholder="••••••••"
            required
          />
          {repite && nueva !== repite && (
            <span className="op-field__error">Las contraseñas no coinciden</span>
          )}
        </div>
      </div>
      <button type="submit" className="op-btn op-btn--primary" disabled={saving || nueva !== repite}>
        {saving ? "Actualizando…" : "Cambiar contraseña 🔒"}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════
   Formulario datos tienda
══════════════════════════════════════════ */
function FormTienda({ tienda, cedula, onGuardado }) {
  const [form, setForm] = useState({
    nombre:          tienda?.nombre          ?? "",
    dominio:         tienda?.dominio         ?? "",
    descripcion:     tienda?.descripcion     ?? "",
    sueldo_mensual:  tienda?.sueldo_mensual  ?? "",
    actividad:       tienda?.actividad       ?? "",
    direccion:       tienda?.direccion       ?? "",
    telefono:        tienda?.telefono        ?? "",
    pasarela_pagos:  tienda?.pasarela_pagos  ?? false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ModificarTienda({ id_usuario: cedula, ...form });
      mostrarAlerta("success", "Tienda actualizada correctamente");
      onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al actualizar la tienda");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="op-form" onSubmit={handleSubmit}>
      <div className="op-form__grid">
        <div className="op-field">
          <label>Nombre de la tienda</label>
          <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Mi Tienda Online" />
        </div>
        <div className="op-field">
          <label>Dominio <span className="op-hint">(URL pública)</span></label>
          <div className="op-input-prefix">
            <span>@</span>
            <input value={form.dominio} onChange={(e) => set("dominio", e.target.value)} placeholder="mi-tienda" />
          </div>
        </div>
        <div className="op-field op-field--full">
          <label>Descripción</label>
          <textarea rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Cuéntanos sobre tu tienda…" />
        </div>
        <div className="op-field">
          <label>Actividad comercial</label>
          <input value={form.actividad} onChange={(e) => set("actividad", e.target.value)} placeholder="Moda, accesorios…" />
        </div>
        <div className="op-field">
          <label>Ingreso mensual aprox.</label>
          <input value={form.sueldo_mensual} onChange={(e) => set("sueldo_mensual", e.target.value)} placeholder="$2.000.000" />
        </div>
        <div className="op-field">
          <label>Dirección física</label>
          <input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle 21 #17-9" />
        </div>
        <div className="op-field">
          <label>Teléfono de contacto</label>
          <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="3001234567" />
        </div>
        <div className="op-field">
          <label className="op-toggle-label">
            <span>Pasarela de pagos</span>
            <button
              type="button"
              className={`op-toggle ${form.pasarela_pagos ? "op-toggle--on" : ""}`}
              onClick={() => set("pasarela_pagos", !form.pasarela_pagos)}
              role="switch"
              aria-checked={form.pasarela_pagos}
            >
              <span className="op-toggle__thumb" />
            </button>
            <span className={`op-toggle-status ${form.pasarela_pagos ? "op-toggle-status--on" : ""}`}>
              {form.pasarela_pagos ? "Activa" : "Inactiva"}
            </span>
          </label>
        </div>
      </div>
      <button type="submit" className="op-btn op-btn--primary" disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios ✓"}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaOpciones() {
  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
  const [cedula,   setCedula]   = useState(null);
  const [usuario,  setUsuario]  = useState(null);
  const [tienda,   setTienda]   = useState(null);
  const [loading,  setLoading]  = useState(true);

  /* ── Auth + carga ── */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const decode = jwtDecode(token);
    setUsername(decode.usuario?.split(" ")[0] ?? "Usuario");
    setCedula(decode.id);
    cargar(decode.id);
  }, []);

  const cargar = async (id) => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        TraerUsuario(id),
        TraerTienda(id),
      ]);
      setUsuario(uRes.data);
      setTienda(tRes.data);
    } catch {
      mostrarAlerta("error", "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const reload = () => cargar(cedula);

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="op-page">
        <span className="op-orb op-orb--one" aria-hidden="true" />
        <span className="op-orb op-orb--two" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="op-header">
          <div>
            <p className="op-eyebrow">⚙️ Configuración</p>
            <h1 className="op-title">Opciones <span>de tu cuenta</span></h1>
            <p className="op-subtitle">
              Gestiona tu información personal, datos de la tienda y preferencias del sistema.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="op-loading">
            <div className="op-loading__spinner" />
            <p>Cargando opciones…</p>
          </div>
        ) : (
          <div className="op-content">

            {/* ── ID + info rápida ── */}
            <div className="op-id-banner">
              <div className="op-id-banner__avatar">
                {usuario?.nombres?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="op-id-banner__info">
                <strong>{usuario?.nombres} {usuario?.apellidos}</strong>
                <span>{usuario?.correo}</span>
              </div>
              <div className="op-id-banner__meta">
                <div className="op-id-pill">
                  <span className="op-id-pill__label">Cédula / ID</span>
                  <span className="op-id-pill__val">{cedula}</span>
                </div>
                <div className="op-id-pill op-id-pill--green">
                  <span className="op-id-pill__label">Rol</span>
                  <span className="op-id-pill__val">{usuario?.rol ?? "tendero"}</span>
                </div>
              </div>
            </div>

            {/* ── Secciones ── */}
            <div className="op-sections">

              <SeccionCard icon="👤" title="Datos personales" defaultOpen>
                <FormUsuario usuario={usuario} cedula={cedula} onGuardado={reload} />
              </SeccionCard>

              <SeccionCard icon="🔒" title="Seguridad — Cambiar contraseña">
                <FormContrasena cedula={cedula} />
              </SeccionCard>

              <SeccionCard icon="🏪" title="Información de la tienda" badge={tienda?.nombre}>
                <FormTienda tienda={tienda} cedula={cedula} onGuardado={reload} />
              </SeccionCard>

              <SeccionCard icon="📞" title="Contacto y soporte">
                <div className="op-contact-grid">
                  {[
                    { icon: "✉️", label: "Correo de soporte",   val: CONTACTO.email },
                    { icon: "💬", label: "WhatsApp",             val: CONTACTO.whatsapp },
                    { icon: "🌐", label: "Sitio web",            val: CONTACTO.web },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="op-contact-item">
                      <span className="op-contact-item__icon">{icon}</span>
                      <div>
                        <p className="op-contact-item__label">{label}</p>
                        <p className="op-contact-item__val">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SeccionCard>

              <SeccionCard icon="ℹ️" title="Acerca de NWBIQShop">
                <div className="op-about">
                  <div className="op-about__brand">
                    <span className="op-about__letter">N</span>
                    <div>
                      <strong>NWBIQ<span>Shop</span></strong>
                      <p>Plataforma de e-commerce para pequeñas tiendas</p>
                    </div>
                  </div>
                  <div className="op-about__specs">
                    {[
                      { label: "Versión",          val: VERSION },
                      { label: "Backend",          val: "FastAPI + SQLAlchemy" },
                      { label: "Frontend",         val: "React + Vite" },
                      { label: "Base de datos",    val: "MySQL / PostgreSQL" },
                      { label: "Autenticación",    val: "JWT" },
                      { label: "Tu ID de usuario", val: cedula },
                    ].map(({ label, val }) => (
                      <div key={label} className="op-spec-row">
                        <span className="op-spec-row__label">{label}</span>
                        <span className="op-spec-row__val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SeccionCard>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PaginaOpciones;
