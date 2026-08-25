export default function FooterP2() {
  const links = ["PolÃ­tica de privacidad", "TÃ©rminos y condiciones", "PolÃ­tica de cookies", "Mapa del sitio", "Centro de servicio", "GuÃ­a de usuario"];
  return <footer className="p2-footer"><div className="p2-social-links"><span className="p2-social-icon" aria-label="Facebook">f</span><span className="p2-social-icon" aria-label="Instagram">ig</span><span className="p2-social-icon" aria-label="Twitter">X</span><span className="p2-social-icon" aria-label="YouTube">â–¶</span></div><div className="p2-footer-links">{links.map((link) => <a key={link} href="#" className="p2-footer-link">{link}</a>)}</div><p>Copyright Â© 2010 - 2026 Tu Tienda. Todos los derechos reservados.</p></footer>;
}
