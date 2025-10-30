'use client';

import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { NewsItem, SopStage, StrategicFocus } from '../lib/types';
import { NewsCard } from './news-card';

interface NewsDashboardProps {
  initialItems: NewsItem[];
}

type StageFilter = SopStage | 'All';
type FocusFilter = StrategicFocus | 'All';

const stageOptions: StageFilter[] = ['All', 'Monitor', 'Assess', 'Follow-up'];
const focusOptions: FocusFilter[] = [
  'All',
  'Regulatory',
  'Commercial',
  'Clinical',
  'Manufacturing',
  'Partnerships',
  'Corporate'
];

const DAY_WINDOWS = [7, 14, 30, 60, 90];

const computeMetrics = (items: NewsItem[]) => {
  const perStage = items.reduce<Record<SopStage, number>>(
    (acc, item) => {
      acc[item.sopStage] += 1;
      return acc;
    },
    { Monitor: 0, Assess: 0, 'Follow-up': 0 }
  );

  const newest = items[0]?.publishedAt
    ? formatDistanceToNow(new Date(items[0].publishedAt), { addSuffix: true })
    : 'n/a';

  return {
    total: items.length,
    perStage,
    newest
  };
};

export default function NewsDashboard({ initialItems }: NewsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<StageFilter>('All');
  const [selectedFocus, setSelectedFocus] = useState<FocusFilter>('All');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [dayWindow, setDayWindow] = useState<number>(30);

  const sourceOptions = useMemo(
    () =>
      Array.from(
        new Set(initialItems.map((item) => `${item.sourceId}::${item.sourceName}`))
      ).map((value) => {
        const [id, label] = value.split('::');
        return { id, label };
      }),
    [initialItems]
  );

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = new Date();

    return initialItems.filter((item) => {
      const published = new Date(item.publishedAt);
      const daysAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);

      if (dayWindow && daysAgo > dayWindow) {
        return false;
      }

      if (selectedStage !== 'All' && item.sopStage !== selectedStage) {
        return false;
      }

      if (selectedFocus !== 'All' && item.focus !== selectedFocus) {
        return false;
      }

      if (selectedSources.length > 0 && !selectedSources.includes(item.sourceId)) {
        return false;
      }

      if (term) {
        const haystack = `${item.title} ${item.summary} ${item.keywords.join(' ')}`.toLowerCase();
        return haystack.includes(term);
      }

      return true;
    });
  }, [initialItems, dayWindow, searchTerm, selectedFocus, selectedStage, selectedSources]);

  const metrics = useMemo(() => computeMetrics(filteredItems), [filteredItems]);

  const groupedByStage = useMemo(() => {
    return filteredItems.reduce<Record<SopStage, NewsItem[]>>(
      (acc, item) => {
        acc[item.sopStage].push(item);
        return acc;
      },
      { Monitor: [], Assess: [], 'Follow-up': [] }
    );
  }, [filteredItems]);

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Biosimilar News Monitor</h1>
          <p className="dashboard__subtitle">
            Aggregated statements and press releases from leading biosimilar sponsors, filtered for
            meaningful updates and mapped to SOP follow-up lanes.
          </p>
        </div>
        <div className="dashboard__meta">
          <span className="meta-chip">Sources: {sourceOptions.length}</span>
          <span className="meta-chip">Coverage window: {dayWindow} days</span>
        </div>
      </header>

      <section className="filters">
        <div className="filters__search">
          <label htmlFor="search">Search intel</label>
          <input
            id="search"
            placeholder="Search by drug, company, or keyword"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="filters__row">
          <div>
            <label htmlFor="stage">SOP lane</label>
            <select
              id="stage"
              value={selectedStage}
              onChange={(event) => setSelectedStage(event.target.value as StageFilter)}
            >
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="focus">Focus</label>
            <select
              id="focus"
              value={selectedFocus}
              onChange={(event) => setSelectedFocus(event.target.value as FocusFilter)}
            >
              {focusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="days">Recency</label>
            <select
              id="days"
              value={dayWindow}
              onChange={(event) => setDayWindow(Number(event.target.value))}
            >
              {DAY_WINDOWS.map((value) => (
                <option key={value} value={value}>
                  Last {value} days
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source">Source</label>
            <select
              id="source"
              value={selectedSources[0] ?? 'all'}
              onChange={(event) =>
                setSelectedSources(
                  event.target.value === 'all' ? [] : [event.target.value]
                )
              }
            >
              <option value="all">All sources</option>
              {sourceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="metrics">
        <div className="metric-card">
          <span className="metric-card__label">Qualified updates</span>
          <strong className="metric-card__value">{metrics.total}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Monitor</span>
          <strong className="metric-card__value mono">{metrics.perStage.Monitor}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Assess</span>
          <strong className="metric-card__value mono">{metrics.perStage.Assess}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Follow-up</span>
          <strong className="metric-card__value mono">{metrics.perStage['Follow-up']}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Latest update</span>
          <strong className="metric-card__value">{metrics.newest}</strong>
        </div>
      </section>

      <section className="lanes">
        {(['Monitor', 'Assess', 'Follow-up'] as SopStage[]).map((stage) => (
          <div key={stage} className={`lane lane-${stage.toLowerCase()}`}>
            <header className="lane__header">
              <h2>{stage}</h2>
              <span>{groupedByStage[stage].length} items</span>
            </header>
            <div className="lane__content">
              {groupedByStage[stage].length === 0 ? (
                <p className="lane__empty">No records match the current filters.</p>
              ) : (
                groupedByStage[stage].map((item) => <NewsCard key={item.id} item={item} />)
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
