export default function P4GuiaTallas() {
  return (
    <section className="p4-tallas" id="guia-tallas">

      <div className="p4-tallas__header">
        <div className="p4-tallas__header-icon" aria-hidden="true">
          <div className="p4-icon-ruler-lg" />
        </div>
        <h2 className="p4-tallas__header-title">Guía de tallas</h2>
        <button type="button" className="p4-tallas__close" aria-label="Cerrar guía de tallas">
          —
        </button>
      </div>

      <div className="p4-tallas__scroll-notice">
        <span className="p4-tallas__scroll-icon" aria-hidden="true">👉</span>
        <span>Desliza las tablas hacia la derecha para ver toda la información</span>
      </div>

      <p className="p4-tallas__intro">
        Medidas tomadas con la prenda extendida, en centímetros. La mayoría de nuestras
        referencias son <strong>talla única</strong> de corte holgado; las categorías
        con tallas específicas (Niñas, Niños, Talla Plus) tienen su propia tabla abajo.
      </p>

      {/* Blusón Oversize */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Blusón Oversize</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO</th><th>LARGO</th></tr></thead>
            <tbody><tr><td>Única</td><td>60 cm</td><td>80 cm</td></tr></tbody>
          </table>
        </div>
      </div>

      {/* Pantalón Manga Larga */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Pantalón Manga Larga (blusa + pantalón)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO PANTALÓN</th></tr></thead>
            <tbody><tr><td>Única</td><td>50 cm</td><td>60 cm</td><td>100 cm</td></tr></tbody>
          </table>
        </div>
      </div>

      {/* Pantalón Manga */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Pantalón Manga (blusa + pantalón)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO PANTALÓN</th></tr></thead>
            <tbody>
              <tr><td>Única</td><td>43 cm</td><td>53 cm</td><td>108 cm</td></tr>
              <tr><td>Molde Amplio</td><td>57 cm</td><td>67 cm</td><td>108 cm</td></tr>
              <tr><td>Plus</td><td>52 cm</td><td>70 cm</td><td>110 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pantalón Tiras */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Pantalón Tiras (top tirantes + pantalón)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO TOP</th><th>LARGO TOP</th><th>LARGO PANTALÓN</th></tr></thead>
            <tbody><tr><td>Única</td><td>50 cm</td><td>50 cm</td><td>100 cm</td></tr></tbody>
          </table>
        </div>
      </div>

      {/* Pantalón Niños */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Pantalón Niños (blusa + pantalón)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO PANTALÓN</th></tr></thead>
            <tbody>
              <tr><td>2-4</td><td>32 cm</td><td>42.5 cm</td><td>50 cm</td></tr>
              <tr><td>6-8</td><td>33.5 cm</td><td>45 cm</td><td>68.5 cm</td></tr>
              <tr><td>10-12</td><td>38 cm</td><td>52 cm</td><td>84 cm</td></tr>
              <tr><td>14-16</td><td>43 cm</td><td>53 cm</td><td>90 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pantalón Hombre Sublimado */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Pantalón Hombre Sublimado (blusa + pantalón)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO PANTALÓN</th></tr></thead>
            <tbody><tr><td>Única</td><td>53 cm</td><td>71.5 cm</td><td>120 cm</td></tr></tbody>
          </table>
        </div>
      </div>

      {/* Pantaloneta Hombre */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Pantaloneta Hombre (blusa + pantaloneta)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO PANTALONETA</th></tr></thead>
            <tbody><tr><td>Única</td><td>53 cm</td><td>71.5 cm</td><td>50 cm</td></tr></tbody>
          </table>
        </div>
      </div>

      {/* Short Manga */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Short Manga (blusa + short)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO SHORT</th></tr></thead>
            <tbody>
              <tr><td>Única</td><td>39.5 cm</td><td>51.5 cm</td><td>26.5 cm</td></tr>
              <tr><td>Molde Amplio</td><td>57 cm</td><td>67 cm</td><td>40 cm</td></tr>
              <tr><td>Plus</td><td>52 cm</td><td>70 cm</td><td>41 cm</td></tr>
              <tr><td>Oversize</td><td>55 cm</td><td>80 cm</td><td>26.5 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Short Niños */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Short Niños (blusa + short)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO BLUSA</th><th>LARGO BLUSA</th><th>LARGO SHORT</th></tr></thead>
            <tbody>
              <tr><td>2-4</td><td>32 cm</td><td>42.5 cm</td><td>20 cm</td></tr>
              <tr><td>6-8</td><td>33.5 cm</td><td>45 cm</td><td>33 cm</td></tr>
              <tr><td>10-12</td><td>38 cm</td><td>52 cm</td><td>37 cm</td></tr>
              <tr><td>14-16</td><td>43 cm</td><td>53 cm</td><td>48 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Short Tiras */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Short Tiras (top tirantes + short)</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO TOP</th><th>LARGO TOP</th><th>LARGO SHORT</th></tr></thead>
            <tbody>
              <tr><td>Única</td><td>39 cm</td><td>39.5 cm</td><td>26.5 cm</td></tr>
              <tr><td>Plus</td><td>49 cm</td><td>56 cm</td><td>41 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Batolas */}
      <div className="p4-tallas__group">
        <h3 className="p4-tallas__group-title">Batolas</h3>
        <div className="p4-tallas__table-wrap">
          <table className="p4-tallas__table">
            <thead><tr><th>TALLA</th><th>ANCHO</th><th>LARGO</th></tr></thead>
            <tbody>
              <tr><td>Única (S-M)</td><td>38.5 cm</td><td>64.5 cm</td></tr>
              <tr><td>Plus (L-XL)</td><td>43 cm</td><td>72 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notas al pie */}
      <div className="p4-tallas__notes">
        <div className="p4-tallas__note p4-tallas__note--pink">
          <strong>Tela:</strong> piel de durazno premium en todas las referencias — suave, fresca y con caída favorecedora.
        </div>
        <div className="p4-tallas__note p4-tallas__note--pink">
          <strong>Nota:</strong> cada prenda es sometida a cambios físicos y químicos durante su confección,
          por lo que estas medidas tienden a variar un poco; son un aproximado casi exacto.
        </div>
      </div>

    </section>
  );
}
