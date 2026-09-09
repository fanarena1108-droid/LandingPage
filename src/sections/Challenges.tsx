import { SectionHeading } from '../components/SectionHeading';
import { Phone } from '../components/Phone';
import { content } from '../content';
export function Challenges() {
  return (
    <section
      id="challenges"
      className="section feature challenges"
      aria-labelledby="challenges-title"
    >
      <div className="feature-layout container">
        <div className="feature-copy reveal">
          <SectionHeading id="challenges-title" {...content.challenges} />
          <dl className="metrics">
            {content.challenges.metrics.map(([value, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="microcopy">{content.challenges.note}</p>
        </div>
        <Phone variant="challenges" />
      </div>
    </section>
  );
}
