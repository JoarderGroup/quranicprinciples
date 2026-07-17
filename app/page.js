'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase
        .schema('quranic_principles')
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    run();
  }, []);

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
      <h1>Quranic Principles — Live</h1>
      <p>{loading ? 'Loading articles...' : `${rows.length} article(s)`}</p>
      <ul>
        {rows.map((item) => (
          <li key={item.id} style={{ marginBottom: 16 }}>
            <strong>{item.title}</strong> · {item.country}
            <div>{item.summary}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
