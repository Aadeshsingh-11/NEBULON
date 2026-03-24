import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

const LiveNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setNews(d.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2 mb-2">
         <h2 className="text-xl font-bold text-foreground">Live Business Feed</h2>
         <p className="text-sm text-muted-foreground">Aggregated real-time updates for SMEs & Startups</p>
      </div>

      {news.length === 0 && (
         <div className="md:col-span-2 glass p-8 text-center rounded-xl text-muted-foreground">
           Failed to load news source.
         </div>
      )}

      {news.map((item, i) => (
        <a 
            key={i} 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
        >
            <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-5 hover-lift cursor-pointer h-full border border-border/50 hover:border-primary/50 transition-colors"
            >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">Industry</span>
                <span className="text-xs text-muted-foreground">{new Date(item.pubDate).toLocaleDateString()}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">{item.title}</h3>
            {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description }}></p>
            )}
            </motion.div>
        </a>
      ))}
    </div>
  );
};
export default LiveNews;
