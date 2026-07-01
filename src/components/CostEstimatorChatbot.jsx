import { useState } from 'react';
import { FaCalculator, FaPaperPlane, FaWhatsapp, FaXmark } from 'react-icons/fa6';
import { estimateProfiles, finishLevels } from '../data/estimatorData';
import { createProjectEstimate, formatCurrency } from '../utils/estimator';

export default function CostEstimatorChatbot() {
  const [open, setOpen] = useState(true);
  const [projectType, setProjectType] = useState('residencial');
  const [finishLevel, setFinishLevel] = useState('medio');
  const [area, setArea] = useState('80');
  const [estimate, setEstimate] = useState(() => createProjectEstimate('residencial', 80, 'medio'));
  const [error, setError] = useState('');

  const estimateText = estimate
    ? `Estimacion ARIA: ${estimate.profile.label}, ${estimate.area} m2, acabado ${estimate.finish.label}. Rango preliminar ${formatCurrency(estimate.low)} a ${formatCurrency(estimate.high)} MXN.`
    : 'Hola Aria Arquitectura, quiero cotizar un proyecto.';
  const quoteWhatsappUrl = `https://wa.me/526182066391?text=${encodeURIComponent(estimateText)}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextEstimate = createProjectEstimate(projectType, area, finishLevel);

    if (!nextEstimate) {
      setError('Escribe una superficie valida en metros cuadrados.');
      return;
    }

    setError('');
    setEstimate(nextEstimate);
  };

  return (
    <aside className={`quote-chatbot ${open ? 'is-open' : ''}`} aria-label="Chat de cotizacion preliminar">
      {open && (
        <div className="quote-chatbot-panel" role="dialog" aria-modal="false" aria-label="Estimador de costos ARIA">
          <header className="quote-chatbot-header">
            <div>
              <div>
                <strong>Estimador ARIA</strong>
                <small>Costos preliminares en Durango</small>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar estimador">
              <FaXmark aria-hidden="true" />
            </button>
          </header>

          <div className="quote-chatbot-body">
            <div className="chat-bubble bot">
              Hola. Te ayudo a calcular un rango inicial segun metros cuadrados, tipo de proyecto y acabados.
            </div>

            <form className="quote-chatbot-form" onSubmit={handleSubmit}>
              <label>
                Tipo de proyecto
                <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
                  {Object.entries(estimateProfiles).map(([key, profile]) => (
                    <option value={key} key={key}>{profile.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Metros cuadrados
                <input value={area} onChange={(event) => setArea(event.target.value)} inputMode="decimal" placeholder="Ej. 80" />
              </label>

              <label>
                Nivel de acabados
                <select value={finishLevel} onChange={(event) => setFinishLevel(event.target.value)}>
                  {Object.entries(finishLevels).map(([key, finish]) => (
                    <option value={key} key={key}>{finish.label}</option>
                  ))}
                </select>
              </label>

              {error && <p className="quote-chatbot-error">{error}</p>}

              <button className="quote-chatbot-submit" type="submit">
                Calcular estimado <FaPaperPlane aria-hidden="true" />
              </button>
            </form>

            {estimate && (
              <div className="chat-bubble bot estimate-result">
                <p><strong>{formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}</strong></p>
                <span>Rango preliminar para {estimate.area} m2 con acabado {estimate.finish.label.toLowerCase()}.</span>
                <ul>
                  {estimate.breakdown.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{formatCurrency(item.low)} - {formatCurrency(item.high)}</strong>
                    </li>
                  ))}
                </ul>
                <small>
                  No incluye terreno, permisos especiales, estudios, muebles sueltos ni variaciones por estructura existente. Proyecto arquitectonico estimado aparte: {formatCurrency(estimate.designLow)} - {formatCurrency(estimate.designHigh)}.
                </small>
              </div>
            )}
          </div>

          <footer className="quote-chatbot-footer">
            <a href={quoteWhatsappUrl} target="_blank" rel="noreferrer">
              Enviar estimado por WhatsApp <FaWhatsapp aria-hidden="true" />
            </a>
          </footer>
        </div>
      )}

      <button
        className="quote-chatbot-toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar estimador de costos' : 'Abrir estimador de costos'}
      >
        {open ? <FaXmark aria-hidden="true" /> : <FaCalculator aria-hidden="true" />}
      </button>
    </aside>
  );
}
