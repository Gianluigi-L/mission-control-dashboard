export interface ProductSearchResult {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  match_rank?: number;
}

export interface UnderperformingProduct extends ProductSearchResult {
  total_clicks: number;
  total_impressions: number;
  ctr: number;
  avg_position: number;
}

export interface ProductKpis {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface QueryData {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr?: number;
}

export interface ProductPositionData {
  kpis: ProductKpis;
  trend: Array<{ date: string; clicks: number; impressions: number; position: number }>;
  topQueries: QueryData[];
  productUrl: string;
}

export interface MetricaCritica {
  nombre: string;
  valor_actual: string;
  valor_ideal: string;
}

export interface Recomendacion {
  accion: string;
  impacto_esperado: 'Alto' | 'Medio' | 'Bajo';
  esfuerzo: 'Alto' | 'Medio' | 'Bajo';
}

export interface SeoSugerido {
  title: string;
  description: string;
  justificacion: string;
}

export interface InspectionResult {
  diagnostico: string;
  fase?: string;
  hipotesis?: string[];
  metricas_criticas?: MetricaCritica[];
  recomendaciones?: Recomendacion[];
  seo_sugerido?: SeoSugerido;
}

export interface InspectApiResponse {
  success: boolean;
  data?: InspectionResult;
  productUrl?: string;
  error?: string;
}
