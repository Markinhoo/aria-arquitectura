import { estimateBreakdown, estimateProfiles, finishLevels } from '../data/estimatorData';

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

export function formatCurrency(value) {
  return currencyFormatter.format(Math.round(value));
}

export function createProjectEstimate(projectType, areaValue, finishLevel) {
  const profile = estimateProfiles[projectType] || estimateProfiles.residencial;
  const finish = finishLevels[finishLevel] || finishLevels.medio;
  const area = Number(areaValue);

  if (!Number.isFinite(area) || area <= 0) return null;

  const low = area * profile.low * finish.low;
  const high = area * profile.high * finish.high;
  const designLow = area * 420;
  const designHigh = area * 850;

  return {
    area,
    profile,
    finish,
    low,
    high,
    designLow,
    designHigh,
    breakdown: estimateBreakdown.map(([label, ratio]) => ({
      label,
      low: low * ratio,
      high: high * ratio
    }))
  };
}
