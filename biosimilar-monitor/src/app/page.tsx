import NewsDashboard from '../components/news-dashboard';
import { loadNews } from '../lib/news';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const items = await loadNews();
  return <NewsDashboard initialItems={items} />;
}
