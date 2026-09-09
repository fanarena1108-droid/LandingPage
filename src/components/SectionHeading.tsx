import { useMobile } from '../useMobile';
const mobile: Record<
  string,
  { title?: string[]; description: string; index?: string }
> = {
  'matchday-title': {
    description:
      'Live events, stats and lineups — every match moment in one place.',
  },
  'talk-title': {
    description: 'Your friends. Live reactions. One matchday conversation.',
  },
  'challenges-title': {
    title: ['Your predictions.', 'Your bragging rights.'],
    description: 'Make your call. Challenge a friend. We’ll keep score.',
  },
  'competitions-title': {
    title: ['Every league.', 'Every table.'],
    description: 'Fixtures, standings and leaders for the leagues you follow.',
  },
  'support-title': {
    index: 'CONNECT & SUPPORT',
    title: ['Stay connected.'],
    description:
      'Follow the launch, or send us your questions, feedback and grievances.',
  },
};
export function SectionHeading({
  id,
  index,
  title,
  description,
}: {
  id: string;
  index: string;
  title: string[];
  description: string;
}) {
  const isMobile = useMobile();
  const copy = isMobile ? mobile[id] : undefined;
  title = copy?.title ?? title;
  description = copy?.description ?? description;
  index = copy?.index ?? index;
  return (
    <>
      <p className="eyebrow">{index}</p>
      <h2 id={id} tabIndex={-1}>
        {title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      <p className="description">{description}</p>
    </>
  );
}
