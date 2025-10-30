'use client';

import { format } from 'date-fns';
import type { NewsItem } from '../lib/types';

interface NewsCardProps {
  item: NewsItem;
}

const formatDate = (isoDate: string): string => {
  try {
    return format(new Date(isoDate), 'dd MMM yyyy');
  } catch {
    return isoDate;
  }
};

const badgeColor = (focus: NewsItem['focus']): string => {
  switch (focus) {
    case 'Regulatory':
      return 'badge regulatory';
    case 'Commercial':
      return 'badge commercial';
    case 'Clinical':
      return 'badge clinical';
    case 'Manufacturing':
      return 'badge manufacturing';
    case 'Partnerships':
      return 'badge partnerships';
    default:
      return 'badge neutral';
  }
};

export function NewsCard({ item }: NewsCardProps) {
  return (
    <article className="news-card">
      <div className="news-card__meta">
        <span className={`badge stage stage-${item.sopStage.toLowerCase()}`}>
          {item.sopStage}
        </span>
        <span className={badgeColor(item.focus)}>{item.focus}</span>
        <span className="news-card__date">{formatDate(item.publishedAt)}</span>
      </div>

      <h3 className="news-card__title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>

      <p className="news-card__summary">{item.summary}</p>

      <div className="news-card__footer">
        <div className="news-card__keywords">
          {item.keywords.slice(0, 4).map((keyword) => (
            <span key={keyword} className="keyword-chip">
              {keyword}
            </span>
          ))}
        </div>
        <div className="news-card__source">
          <span>{item.sourceName}</span>
          <span className="confidence">Confidence: {item.confidence}</span>
        </div>
        <p className="news-card__action">{item.followUpAction}</p>
      </div>
    </article>
  );
}
