import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img
            src="/logo.png"
            alt="Logo de NWBIQShop"
            className="footer-logo"
          />
          <div>
            <strong>NWBIQShop</strong>
            <p>{"Tu vitrina digital, hecha para vender f\u00e1cil."}</p>
          </div>
        </div>
        <div className="footer-links">
          <a href="#beneficios">Beneficios</a>
          <a href="#como-funciona">{"C\u00f3mo funciona"}</a>
          <a href="mailto:hola@nwbiqshop.com">{"Cont\u00e1ctanos"}</a>
        </div>
      </div>
      <p className="footer-copy">
        {"\u00a9"} {new Date().getFullYear()} NWBIQShop.{" "}
        {"Construido para peque\u00f1as tiendas que sue\u00f1an en grande."}
      </p>
    </footer>
  );
}

export default Footer;
