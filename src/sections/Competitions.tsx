import { SectionHeading } from '../components/SectionHeading';
import { Phone } from '../components/Phone';
import { content } from '../content';
export function Competitions() {
  return (
    <section
      id="competitions"
      className="section competitions"
      aria-labelledby="competitions-title"
    >
      <div className="container">
        <div className="competition-heading reveal">
          <SectionHeading id="competitions-title" {...content.competitions} />
        </div>
        <div className="competition-art">
          <Phone variant="competitions" />
          <div className="league-chips" aria-hidden="true">
            {content.competitions.leagues.map((league, i) => (
              <span className={`league-chip league-${i}`} key={league}>
                {league}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
