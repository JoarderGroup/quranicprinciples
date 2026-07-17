'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://euynzedvxrumsghushon.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmVuamhzanpnY3JsanR4b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjM4MDYsImV4cCI6MjA5OTUzOTgwNn0.Z332ic8UcDiLc6F8oSbHHLIxOrYVbSLb3Dz-SQffovQ'

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const BG = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231A3323' stroke-width='0.6'%3E%3Cpolygon points='40,8 44,30 66,30 49,43 55,65 40,53 25,65 31,43 14,30 36,30'/%3E%3Cline x1='40' y1='0' x2='40' y2='8'/%3E%3Cline x1='40' y1='72' x2='40' y2='80'/%3E%3Cline x1='0' y1='40' x2='8' y2='40'/%3E%3Cline x1='72' y1='40' x2='80' y2='40'/%3E%3C/g%3E%3C/svg%3E")`

async function getArticles() {
  try {
    const { data } = await supabase
      .schema('quranic_principles')
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    return data || []
  } catch { return [] }
}

export default function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getArticles().then(rows => {
      if (active) {
        setArticles(rows)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  return (
    <main style={{
      fontFamily: "'Georgia', serif",
      background: '#060F0C',
      backgroundImage: BG,
      minHeight: '100vh',
      color: '#7FA88A'
    }}>

      <header style={{
        background: '#0C1C15',
        borderBottom: '1px solid #1A3323',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        height: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '21px', height: '21px', background: '#C9A04A', borderRadius: '2px', position: 'absolute' }} />
            <div style={{ width: '21px', height: '21px', background: '#C9A04A', borderRadius: '2px', position: 'absolute', transform: 'rotate(45deg)' }} />
            <div style={{ width: '9px', height: '9px', background: '#0C1C15', borderRadius: '1px', position: 'absolute', zIndex: 1 }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#E8E3D5', letterSpacing: '-0.02em' }}>
              Quranic Principles
            </div>
            <div style={{ fontSize: '10px', color: '#445A4C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              Journal of the Muslim World
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#445A4C', fontFamily: 'sans-serif' }}>
            Loading edition…
          </div>
        ) : articles.length === 0 ? (

          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
              display: 'inline-block', marginBottom: '36px',
              padding: '22px 30px', background: '#130F05',
              border: '1px solid #7A623033', borderRadius: '14px'
            }}>
              <div style={{ fontSize: '10px', color: '#7A6230', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'sans-serif' }}>
                Foundation
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '20px', color: '#C9A04A', lineHeight: '2.2', direction: 'rtl' }}>
                وَلَا تَهِنُوا وَلَا تَحْزَنُوا
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#7FA88A', fontStyle: 'italic', lineHeight: '1.8' }}>
                “Do not weaken and do not grieve.”
              </p>
              <div style={{ fontSize: '11px', color: '#7A6230', fontFamily: 'sans-serif' }}>
                Āl ʿImrān · 3:139
              </div>
            </div>

            <h1 style={{ fontSize: '30px', color: '#E8E3D5', margin: '0 0 14px', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Quranic Principles
            </h1>
            <p style={{ fontSize: '15px', color: '#7FA88A', maxWidth: '500px', margin: '0 auto 10px', lineHeight: '1.85', fontFamily: 'sans-serif' }}>
              A journal connecting Quranic wisdom to the real lives of Muslims around the world.
              Calm. Human-centered. Rooted in the Book.
            </p>
            <p style={{ fontSize: '12px', color: '#445A4C', fontFamily: 'sans-serif', marginTop: '24px' }}>
              First edition coming soon · بإذن الله
            </p>
          </div>

        ) : (

          <>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '24px', color: '#E8E3D5', margin: '0 0 8px', fontWeight: '700', letterSpacing: '-0.02em' }}>
                Latest from the Muslim World
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#445A4C', fontFamily: 'sans-serif' }}>
                {articles.length} articles · Updated daily · Sources attributed to original publishers
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {articles.map(article => (
                <article key={article.id} style={{
                  background: '#0C1C15',
                  border: '1px solid #1A3323',
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                      fontSize: '10px', color: '#C9A04A', background: '#130F05',
                      padding: '3px 10px', borderRadius: '20px',
                      fontFamily: 'sans-serif', border: '1px solid #7A623033'
                    }}>
                      📍 {article.country}
                    </span>
                    <span style={{ fontSize: '22px' }}>{article.image_emoji || '🌙'}</span>
                  </div>

                  <div style={{ fontSize: '10px', color: '#7A6230', fontFamily: 'sans-serif', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    {article.surah_name} {article.surah_number}:{article.ayah_number}
                  </div>

                  <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#C9A04A', fontStyle: 'italic', lineHeight: '1.7', borderLeft: '2px solid #7A6230', paddingLeft: '10px' }}>
                    “{article.principle}”
                  </p>

                  <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '700', color: '#E8E3D5', lineHeight: '1.45', fontFamily: 'sans-serif' }}>
                    {article.title}
                  </h2>

                  <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#7FA88A', lineHeight: '1.65', fontStyle: 'italic' }}>
                    {article.human_dimension}
                  </p>

                  <div style={{ background: '#130F05', borderRadius: '8px', padding: '14px', marginBottom: '14px', border: '1px solid #7A623022' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '17px', color: '#C9A04A', lineHeight: '2', textAlign: 'right', direction: 'rtl' }}>
                      {article.arabic_text}
                    </p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#7FA88A', fontStyle: 'italic', lineHeight: '1.7' }}>
                      “{article.english_translation}”
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#445A4C', fontFamily: 'sans-serif' }}>
                    <span>
                      📰 {article.source}
                      {article.source_url && (
                        <> · <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#7A6230', textDecoration: 'none' }}>Original ↗</a></>
                      )}
                    </span>
                    <span>{article.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #1A3323', padding: '28px 32px', textAlign: 'center', marginTop: '60px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#7FA88A', fontFamily: 'sans-serif' }}>
          Quranic Principles · Journal of the Muslim World
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: '#445A4C', fontFamily: 'sans-serif' }}>
          All news content sourced and attributed to original publishers · Quranic wisdom as the editorial lens
        </p>
      </footer>

    </main>
  )
}
