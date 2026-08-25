import { useState } from "react";

export default function NewsletterP2() {
  const [email, setEmail] = useState("");
  return <section className="p2-newsletter"><h2 className="p2-newsletter-title">SuscrÃ­bete y recibe las Ãºltimas noticias</h2><p className="p2-newsletter-desc">Recibe ofertas exclusivas y novedades directamente en tu correo</p><div className="p2-newsletter-form"><input type="email" placeholder="Tu correo electrÃ³nico" value={email} onChange={(event) => setEmail(event.target.value)} className="p2-newsletter-input" aria-label="Correo electrÃ³nico para suscripciÃ³n" /><button className="p2-newsletter-btn">SuscrÃ­bete</button></div></section>;
}
