import { metricCards, moduleCards } from "@/shared/config/dashboard";
import { formatNumber } from "@/shared/lib/formatNumber";
import { SectionCard } from "@/shared/ui/SectionCard";

export function DashboardOverview() {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <div className="overview__header">
        <div>
          <p className="page__kicker">Suggested baseline</p>
          <h2 id="overview-title" className="overview__title">
            Susunan direktori yang disarankan
          </h2>
        </div>
        <p className="overview__subtitle">
          Pisahkan aturan app, halaman, widget, dan shared utility sejak awal.
        </p>
      </div>

      <div className="metrics-grid">
        {metricCards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-card__label">{card.label}</div>
            <div className="metric-card__value">{formatNumber(card.value)}</div>
            <div className="metric-card__hint">{card.hint}</div>
          </article>
        ))}
      </div>

      <div className="section-grid">
        {moduleCards.map((card) => (
          <SectionCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
