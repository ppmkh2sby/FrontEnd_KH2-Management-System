import type { SectionCardProps } from "@/shared/types/dashboard";

export function SectionCard({
  title,
  description,
  badge,
  items,
}: SectionCardProps) {
  return (
    <article className="section-card">
      <div className="section-card__header">
        <div>
          <h3 className="section-card__title">{title}</h3>
          <p className="section-card__description">{description}</p>
        </div>
        <div className="section-card__badge">{badge}</div>
      </div>

      <ul className="section-card__list">
        {items.map((item) => (
          <li key={`${title}-${item.label}`} className="section-card__item">
            <strong>{item.label}</strong>
            <span className="section-card__meta">{item.meta}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
