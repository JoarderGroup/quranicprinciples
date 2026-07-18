import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

async function getArticles() {
  if (!supabase) return []
  try {
    const { data } = await supabase
      
      .from('qp_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    return data || []
  } catch { return [] }
}

export const revalidate = 3600

export default async function Home() {
  const articles = await getArticles()
  const BG = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231A3323' stroke-width='0.6'%3E%3Cpolygon points='40,8 44,30 66,30 49,43 55,65 40,53 25,65 31,43 14,30 36,30'/%3E%3C/g%3E%3C/svg%3E")`

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#060F0C', backgroundImage: BG, minHeight: '100vh', color: '#7FA88A' }}>
      <header style={{ background: '#0C1C15', borderBottom: '1px solid #1A3323', padding: '0 32px', display: 'flex', alignItems: 'center', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '21px', height: '21px', background: '#C9A04A', borderRadius: '2px', position: 'absolute' }} />
            <div style={{ width: '21px', height: '21px', background: '#C9A04A', borderRadius: '2px', position: 'absolute', transform: 'rotate(45deg)' }} />
            <div style={{ width: '9px', height: '9px', background: '#0C1C15', borderRadius: '1px', position: 'absolute', zIndex: 1 }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#E8E3D5' }}>Quranic Principles</div>
            <div style={{ fontSize: '10px', color: '#445A4C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Journal of the Muslim World</div>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ display: 'inline-block', marginBottom: '36px', padding: '22px 30px', background: '#130F05', border: '1px solid #7A623033', borderRadius: '14px' }}>
              <div style={{ fontSize: '10px', color: '#7A6230', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'sans-serif' }}>Foundation</div>
              <p style={{ margin: '0 0 8px', fontSize: '20px', color: '#C9A04A', lineHeight: '2.2', direction: 'rtl' }}>وَلَا تَهِنُوا وَلَا تَحْزَنُوا</p>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#7FA88A', fontStyle: 'italic', lineHeight: '1.8' }}>&ldquo;Do not weaken and do not grieve.&rdquo;</p>
              <div style={{ fontSize: '11px', color: '#7A6230', fontFamily: 'sans-serif' }}>Āl ʿImrān · 3:139</div>
            </div>
            <h1 style={{ fontSize: '30px', color: '#E8E3D5', margin: '0 0 14px', fontWeight: '700' }}>Quranic Principles</h1>
            <p style={{ fontSize: '15px', color: '#7FA88A', maxWidth: '500px', margin: '0 auto 10px', lineHeight: '1.85', fontFamily: 'sans-serif' }}>A journal connecting Quranic wisdom to the real lives of Muslims around the world. Calm. Human-centered. Rooted in the Book.</p>
            <p style={{ fontSize: '12px', color: '#445A4C', fontFamily: 'sans-serif', marginTop: '24px' }}>First edition coming soon · بإذن الله</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '24px', color: '#E8E3D5', margin: '0 0 8px', fontWeight: '700' }}>Latest from the Muslim World</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#445A4C', fontFamily: 'sans-serif' }}>{articles.length} articles · Updated daily</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {articles.map(article => (
                <article key={article.id} style={{ background: '#0C1C15', border: '1px solid #1A3323', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', color: '#C9A04A', background: '#130F05', padding: '3px 10px', borderRadius: '20px', fontFamily: 'sans-serif', border: '1px solid #7A623033' }}>📍 {article.country}</span>
                    <span style={{ fontSize: '22px' }}>{article.image_emoji || '🌙'}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#7A6230', fontFamily: 'sans-serif', marginBottom: '6px' }}>{article.surah_name} {article.surah_number}:{article.ayah_number}</div>
                  <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#C9A04A', fontStyle: 'italic', lineHeight: '1.7', borderLeft: '2px solid #7A6230', paddingLeft: '10px' }}>&ldquo;{article.principle}&rdquo;</p>
                  <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '700', color: '#E8E3D5', lineHeight: '1.45', fontFamily: 'sans-serif' }}>{article.title}</h2>
                  <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#7FA88A', lineHeight: '1.65', fontStyle: 'italic' }}>{article.human_dimension}</p>
                  <div style={{ background: '#130F05', borderRadius: '8px', padding: '14px', marginBottom: '14px', border: '1px solid #7A623022' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '17px', color: '#C9A04A', lineHeight: '2', textAlign: 'right', direction: 'rtl' }}>{article.arabic_text}</p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#7FA88A', fontStyle: 'italic', lineHeight: '1.7' }}>&ldquo;{article.english_translation}&rdquo;</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#445A4C', fontFamily: 'sans-serif' }}>
                    <span>📰 {article.source}{article.source_url ? <> · <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#7A6230', textDecoration: 'none' }}>Original ↗</a></> : ''}</span>
                    <span>{article.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      <footer style={{ borderTop: '1px solid #1A3323', padding: '28px 32px', textAlign: 'center', marginTop: '60px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#7FA88A', fontFamily: 'sans-serif' }}>Quranic Principles · Journal of the Muslim World</p>
        <p style={{ margin: 0, fontSize: '11px', color: '#445A4C', fontFamily: 'sans-serif' }}>All news content sourced and attributed to original publishers · Quranic wisdom as the editorial lens</p>
      </footer>
    </main>
  )
}
