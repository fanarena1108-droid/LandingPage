import { SectionHeading } from '../components/SectionHeading';
import { Phone } from '../components/Phone';
import { content } from '../content';
export function Matchday() {
  return (
    <section
      id="matchday"
      className="section feature matchday"
      aria-labelledby="matchday-title"
    >
      <div className="feature-layout container">
        <div className="feature-copy reveal">
          <SectionHeading id="matchday-title" {...content.matchday} />
          <div className="feature-cards">
            {content.matchday.features.map(([title, text]) => (
              <article className="feature-card reveal" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
        <Phone variant="live" />
      </div>
    </section>
  );
}
