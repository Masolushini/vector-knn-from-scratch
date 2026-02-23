import React, { useState, useEffect, useMemo } from 'react';
import { getEmbedding } from './lib/gemini';
import { dotProduct, magnitude, cosineSimilarity, generateProjectionMatrix, projectVector } from './lib/vectorMath';
import { VectorVis } from './components/VectorVis';
import { Plus, Search, Trash2, Calculator, Code, Database, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Document {
  id: string;
  text: string;
  embedding: number[];
}

interface Query {
  text: string;
  embedding: number[] | null;
}

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [query, setQuery] = useState<Query>({ text: '', embedding: null });
  const [inputText, setInputText] = useState('');
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Generate a random projection matrix once on mount to keep the visualization consistent
  // In a real app, you might use PCA, but random projection is surprisingly effective for high-dim data
  const projectionBasis = useMemo(() => generateProjectionMatrix(768), []);

  const handleAddDocument = async () => {
    if (!inputText.trim()) return;
    
    setIsEmbedding(true);
    setError(null);
    try {
      const embedding = await getEmbedding(inputText);
      const newDoc: Document = {
        id: Math.random().toString(36).substring(7),
        text: inputText,
        embedding
      };
      setDocuments(prev => [...prev, newDoc]);
      setInputText('');
    } catch (error: any) {
      setError(error.message || "Failed to generate embedding. Please try again.");
    } finally {
      setIsEmbedding(false);
    }
  };

  const handleSearch = async () => {
    if (!query.text.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const embedding = await getEmbedding(query.text);
      setQuery(prev => ({ ...prev, embedding }));
    } catch (error: any) {
      setError(error.message || "Failed to generate query embedding.");
    } finally {
      setIsSearching(false);
    }
  };

  const results = useMemo(() => {
    if (!query.embedding) return [];
    
    return documents.map(doc => {
      try {
        const similarity = cosineSimilarity(query.embedding!, doc.embedding);
        return { ...doc, similarity };
      } catch (e) {
        console.warn("Vector dimension mismatch during similarity calculation", e);
        return { ...doc, similarity: 0 };
      }
    }).sort((a, b) => b.similarity - a.similarity);
  }, [documents, query.embedding]);

  const visualizationData = useMemo(() => {
    const points = documents.map(doc => {
      try {
        const proj = projectVector(doc.embedding, projectionBasis);
        return { ...proj, text: doc.text, type: 'document' as const, id: doc.id };
      } catch (e) {
        return { x: 0, y: 0, text: doc.text, type: 'document' as const, id: doc.id };
      }
    });

    if (query.embedding) {
      try {
        const proj = projectVector(query.embedding, projectionBasis);
        points.push({ ...proj, text: query.text, type: 'query' as const, id: 'query' });
      } catch (e) {
        points.push({ x: 0, y: 0, text: query.text, type: 'query' as const, id: 'query' });
      }
    }
    
    return points;
  }, [documents, query.embedding, projectionBasis]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">
              Vector Search <span className="text-slate-500 font-normal">Explainer</span>
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Model: text-embedding-004 (768d)
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Error Banner */}
        {error && (
          <div className="lg:col-span-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-rose-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Left Column: Inputs & Controls */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Add Document Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">1. Knowledge Base</h2>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">{documents.length} docs</span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to add to the vector database..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none h-24 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddDocument();
                  }
                }}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAddDocument}
                  disabled={isEmbedding || !inputText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEmbedding ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Embed & Add
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-slate-700 transition-colors"
                  >
                    <div className="mt-1 min-w-[4px] h-4 bg-blue-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 line-clamp-2">{doc.text}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-600">ID: {doc.id}</span>
                        <span className="text-[10px] font-mono text-slate-600">Vector: [{doc.embedding.slice(0, 3).map(n => n.toFixed(2)).join(', ')}...]</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {documents.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">No documents yet.</p>
                  <p className="text-slate-600 text-xs mt-1">Add some text to build your index.</p>
                </div>
              )}
            </div>
          </section>

          {/* Search Section */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">2. Semantic Query</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={query.text}
                onChange={(e) => setQuery(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Search..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.text.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>
          </section>

        </div>

        {/* Right Column: Visualization & Results */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Visualization */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">3. Vector Space (2D Projection)</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calculator className="w-3 h-3" />
                <span>Random Projection from 768d</span>
              </div>
            </div>
            <div className="relative group">
              <VectorVis data={visualizationData} />
              {/* Overlay explanation */}
              <div className="absolute top-4 left-4 max-w-xs pointer-events-none">
                 <p className="text-xs text-slate-500 bg-slate-950/80 p-2 rounded border border-slate-800 backdrop-blur-sm">
                   Points closer together are semantically similar. 
                   <br/>
                   <span className="text-blue-400">Blue</span> = Documents
                   <br/>
                   <span className="text-rose-400">Red</span> = Query
                 </p>
              </div>
            </div>
          </section>

          {/* Results & Math */}
          {query.embedding && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Results List */}
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">4. Nearest Neighbors</h2>
                <div className="space-y-2">
                  {results.slice(0, 3).map((result, idx) => (
                    <div key={result.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" style={{ opacity: result.similarity }} />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-slate-500">Rank #{idx + 1}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {(result.similarity * 100).toFixed(1)}% Match
                        </span>
                      </div>
                      <p className="text-sm text-slate-200">{result.text}</p>
                      <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500 font-mono">
                        <span>Score: {result.similarity.toFixed(4)}</span>
                        <span>ID: {result.id}</span>
                      </div>
                    </div>
                  ))}
                  {results.length === 0 && (
                    <p className="text-slate-500 text-sm italic">No documents found.</p>
                  )}
                </div>
              </div>

              {/* Math Explainer */}
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">5. The Math (Cosine Similarity)</h2>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
                    <Code className="w-4 h-4" />
                    <span>Raw Calculation</span>
                  </div>
                  
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-slate-500 mb-1">// Formula</p>
                        <p className="text-emerald-400">similarity = (A · B) / (||A|| * ||B||)</p>
                      </div>

                      <div>
                        <p className="text-slate-500 mb-1">// Query Vector (A) [first 5 dims]</p>
                        <p className="text-rose-400">[{query.embedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]</p>
                      </div>

                      <div>
                        <p className="text-slate-500 mb-1">// Top Result Vector (B) [first 5 dims]</p>
                        <p className="text-blue-400">[{results[0].embedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-500 mb-1">Dot Product (A·B)</p>
                          <p className="text-slate-200">{dotProduct(query.embedding, results[0].embedding).toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Magnitudes</p>
                          <p className="text-slate-200">||A|| = {magnitude(query.embedding).toFixed(4)}</p>
                          <p className="text-slate-200">||B|| = {magnitude(results[0].embedding).toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 italic">Run a search to see the calculation.</p>
                  )}
                </div>
              </div>

            </section>
          )}

        </div>
      </main>
    </div>
  );
}
