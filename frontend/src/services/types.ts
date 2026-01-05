export type DocumentScore = {
  novelty_score: number
  depth_score: number
  redundancy_score: number
  cognitive_load_score: number
  overall_value_score: number
  novelty_explanation?: string
  depth_explanation?: string
  redundancy_explanation?: string
  cognitive_load_explanation?: string
  calculated_at: string
}

export type DocumentConcept = {
  name: string
  relevance: number
}

export type Document = {
  id: string
  title: string
  content_type: string
  source_type: string
  source_url?: string | null
  source_name?: string | null
  author?: string | null
  word_count: number
  char_count: number
  estimated_read_time: number
  is_processed: boolean
  ingested_at: string
  created_at: string
  score: DocumentScore | null
  concepts: DocumentConcept[]
}

export type DashboardStats = {
  total_documents: number
  total_words: number
  total_concepts: number
  avg_novelty: number
  avg_depth: number
  recent_redundancies: number
  recent_contradictions: number
}
