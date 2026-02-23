# Vector Search Explainer

This application is an interactive educational tool designed to demystify the "magic" behind Vector Search and Retrieval-Augmented Generation (RAG) systems. It allows you to build a small vector database from scratch in your browser and visualize how semantic search works under the hood.

## What is this application?

Modern AI applications often rely on **Vector Search** to find relevant information. Instead of matching exact keywords (like traditional search engines), vector search understands the *meaning* of text.

This app lets you:
1.  **Create a Knowledge Base**: Add your own text snippets (documents).
2.  **Generate Embeddings**: See how text is converted into arrays of numbers (vectors) using Google's Gemini API.
3.  **Visualize the Space**: Watch how similar concepts group together in a 2D projection of the high-dimensional vector space.
4.  **Perform Semantic Search**: Query your knowledge base and see how the system finds the "nearest neighbors" based on meaning, not just matching words.
5.  **Understand the Math**: View the raw calculations for Cosine Similarity to understand exactly how "closeness" is measured.

## How does it work?

The application follows a standard Vector Search pipeline, but runs it entirely in your browser (except for the embedding generation):

### 1. Embedding Generation
When you add a document or type a query, the app sends the text to the **Gemini API** (`text-embedding-004` model). The model returns a **vector**—a list of 768 numbers that represent the semantic meaning of that text.

### 2. Vector Storage
The app stores these vectors in memory along with the original text. In a real-world application, this would be handled by a Vector Database (like Pinecone, Milvus, or pgvector).

### 3. Dimensionality Reduction (Visualization)
Since we can't visualize 768 dimensions, the app uses a **Random Projection** technique to map these vectors down to a 2D plane (X and Y coordinates). This allows us to plot them on a chart.
*   **Note**: Points that are close together in the chart are semantically similar.

### 4. Similarity Calculation
When you perform a search, the app compares your **Query Vector** against every **Document Vector** in the database.
It uses **Cosine Similarity** to measure the angle between vectors:
*   **1.0**: Identical meaning (0° angle)
*   **0.0**: Unrelated / Orthogonal (90° angle)
*   **-1.0**: Opposite meaning (180° angle)

### 5. Ranking (K-Nearest Neighbors)
The documents are sorted by their similarity score, and the top results (the "Nearest Neighbors") are returned as the search results.

## Key Concepts

*   **Embedding**: A numerical representation of text.
*   **Vector Space**: A mathematical space where concepts are located based on meaning.
*   **Cosine Similarity**: A metric used to measure how similar two vectors are.
*   **KNN (K-Nearest Neighbors)**: An algorithm to find the `k` closest points to a query point.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **AI/Embeddings**: Google Gemini API (`text-embedding-004`)
*   **Visualization**: Recharts
*   **Icons**: Lucide React
