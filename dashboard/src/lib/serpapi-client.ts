export interface TrendsMomentum {
  query: string;
  direction: 'rising' | 'declining' | 'stable';
  percentage: number;
}

export interface TrendsResult {
  timeline: any[];
  queries: string[];
  queriesWithMomentum: TrendsMomentum[];
  topRegion: string;
}

/**
 * Consulta Google Trends vía SerpAPI.
 * Reutilizable por cualquier módulo del dashboard.
 */
export async function fetchGoogleTrends(params: {
  queries: string[];
  geo?: string;
  date?: string;
}): Promise<TrendsResult | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || params.queries.length === 0) return null;

  const q = params.queries.join(',');
  const date = params.date || 'today 12-m';
  const geo = params.geo || '';
  const SERPAPI = 'https://serpapi.com';

  const url = new URL(`${SERPAPI}/search.json`);
  url.searchParams.set('engine', 'google_trends');
  url.searchParams.set('q', q);
  url.searchParams.set('date', date);
  url.searchParams.set('data_type', 'TIMESERIES');
  if (geo) url.searchParams.set('geo', geo);
  url.searchParams.set('api_key', apiKey);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const json = await res.json();

    if (json.error || !json.interest_over_time) {
      return null;
    }

    const timeline = json.interest_over_time.timeline_data ?? [];
    const averages = json.interest_over_time.averages ?? [];
    
    // Calcular momentum para cada query
    const queriesWithMomentum: TrendsMomentum[] = params.queries.map(query => {
      // Filtrar los valores de la query en la línea de tiempo
      const values = timeline
        .flatMap((point: any) => point.values || [])
        .filter((v: any) => v.query === query)
        .map((v: any) => parseInt(v.extracted_value, 10) || 0);

      let direction: 'rising' | 'declining' | 'stable' = 'stable';
      let percentage = 0;

      if (values.length >= 2) {
        // Simple momentum calculation: compare last half vs first half
        const half = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, half);
        const secondHalf = values.slice(half);

        const avgFirst = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;

        if (avgFirst > 0) {
          percentage = ((avgSecond - avgFirst) / avgFirst) * 100;
          if (percentage >= 10) direction = 'rising';
          else if (percentage <= -10) direction = 'declining';
        } else if (avgSecond > 0) {
           percentage = 100;
           direction = 'rising';
        }
      }

      return {
        query,
        direction,
        percentage
      };
    });

    return {
      timeline,
      queries: params.queries,
      queriesWithMomentum,
      topRegion: '—' // To get region we need a separate GEO_MAP call, skipping here for speed if not needed, or add if necessary
    };
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return null;
  }
}
