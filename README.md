# Node.js RAG CLI OpenAI

A simple yet powerful **Retrieval-Augmented Generation (RAG)** system built with Node.js This CLI application demonstrates how to combine local documents with OpenAI's language models to answer questions based on your own data.

## What is RAG?

**Retrieval-Augmented Generation (RAG)** is a technique that enhances Large Language Models (LLMs) by:
1. Retrieving relevant information from a knowledge base first
2. Using that information as context
3. Generating accurate answers based on that context

Instead of relying solely on the LLM's training data, RAG retrieves specific, relevant information and feeds it to the model, resulting in more accurate and grounded answers.

---

## How It Works: The RAG Pipeline

The system follows this workflow:

### **Step 1: Load** 
- Read your document(s) from `docs.txt`
- The system loads all the text data into memory

### **Step 2: Split** 
- Break the document into smaller, manageable **chunks**
- Chunks are split by periods (`.`) to create meaningful sentences/paragraphs
- Example: `"Hello. World."` → `["Hello", "World"]`

### **Step 3: Embed** 
- Convert each chunk into a numerical representation called an **embedding**
- An embedding is a vector of numbers that represents the semantic meaning of the text
- Uses OpenAI's `text-embedding-3-small` model
- This creates a small in-memory **vector database**

### **Step 4: User Question** 
- User asks a question via the CLI
- The system waits for input

### **Step 5: Embed Question** 
- Convert the user's question into an embedding using the same model
- Now the question and chunks are in the same numerical space

### **Step 6: Search** 
- Compare the question embedding with all chunk embeddings using **cosine similarity**
- Cosine similarity measures how alike two vectors are (0 = not similar, 1 = identical)
- Find the top matching chunks (most relevant to the question)

### **Step 7: Retrieve** 
- Extract the best matching chunks (default: top 2)
- Combine them into a context string
- This context contains the most relevant information for the question

### **Step 8: Generate** 
- Send the context + question to GPT-4 mini
- The LLM reads the context and generates an accurate answer
- The system is instructed to: *"Answer ONLY using the provided context"*

### **Step 9: Return Answer** 
- Display the generated answer to the user
- Close the CLI

---

## Visual Pipeline

```
docs.txt
   ↓
[Load] → Raw document text
   ↓
[Split] → Chunks: ["chunk1", "chunk2", ...]
   ↓
[Embed] → Embeddings database: [{text, embedding}, ...]
   ↓
User asks: "What is X?"
   ↓
[Embed Question] → Question embedding
   ↓
[Search] → Cosine similarity comparison
   ↓
[Retrieve] → Top 2 relevant chunks (context)
   ↓
[Generate] → Send to GPT-4 with context
   ↓
LLM Answer
```

---

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (get one at https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AymaneMehdi/Node.js-RAG-CLI-OpenAI.git
   cd Node.js-RAG-CLI-OpenAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   ```bash
   echo OPENAI_API_KEY=your_api_key_here > .env
   ```
   Replace `your_api_key_here` with your actual OpenAI API key.

4. **Create a `docs.txt` file** (your knowledge base)
   ```bash
   # Add your documents/data to docs.txt
   # Example:
   # "The Earth orbits the Sun. The Sun is a star. Stars are massive celestial bodies."
   ```

### Running the Application

```bash
node RAG.js
```

You'll see a prompt:
```
Ask a question: 
```

Type your question and press Enter. The system will:
1. Convert your question to an embedding
2. Search for relevant chunks
3. Send context to the LLM
4. Display the answer

**Example:**
```
Ask a question: What orbits the Sun?
Answer:
The Earth orbits the Sun.
```

---

## Project Structure

```
Node.js-RAG-CLI-OpenAI/
├── RAG.js           # Main application file
├── docs.txt         # Your knowledge base (create this)
├── .env             # Environment variables (create this)
├── package.json     # Dependencies and metadata
└── README.md        # This file
```

---

## How the Code Works

### Key Components

| Component | Purpose |
|-----------|---------|
| **createEmbedding()** | Converts text to a vector using OpenAI's embedding model |
| **cosineSimilarity()** | Compares two embeddings to measure similarity (0-1) |
| **chunkEmbeddings** | In-memory vector database storing text + embeddings |
| **readline** | CLI interface for user input |
| **OpenAI API** | Generates embeddings and answers |

### Important Variables

- `documentText` - The raw content from `docs.txt`
- `chunks` - Text split into smaller pieces
- `chunkEmbeddings` - Array of `{text, embedding}` objects
- `questionEmbedding` - Embedding of user's question
- `results` - Top 2 matching chunks sorted by similarity
- `context` - Combined relevant text sent to LLM

---

## Example Workflow

**Scenario:** You have a document about the Solar System

**docs.txt:**
```
The Solar System contains eight planets. 
Mercury is the closest to the Sun. 
Venus has a thick atmosphere. 
Earth is our home planet. 
Mars is known as the Red Planet. 
Jupiter is the largest planet. 
Saturn has prominent rings. 
Uranus and Neptune are ice giants.
```

**User Input:**
```
Ask a question: Which planet is closest to the Sun?
```

**System Process:**
1. Embeds question: "Which planet is closest to the Sun?"
2. Compares with all chunks
3. Finds best match: "Mercury is the closest to the Sun."
4. Sends to LLM with context
5. Returns answer: "Mercury is the closest planet to the Sun."

---

## Configuration

### Adjustable Parameters (in `RAG.js`)

- **Chunk split method:** Change `.split(".")` to use different delimiters
- **Top results:** Change `.slice(0, 2)` to retrieve more/fewer chunks
- **Embedding model:** Change `text-embedding-3-small` to other OpenAI models
- **LLM model:** Change `gpt-4.1-mini` to use different models
- **System prompt:** Modify the system message to change answer behavior

### Example: Get Top 5 Results Instead of 2

```javascript
// Change this line (around line 142):
.slice(0, 2);  // Get 2 results

// To:
.slice(0, 5);  // Get 5 results
```

---

## Tips & Best Practices

1. **Document Quality:** Better documents = better answers. Keep `docs.txt` organized and relevant.

2. **Chunk Size:** Smaller chunks improve matching precision but may lose context. Experiment with split methods.

3. **Context Length:** More context (more chunks) gives better answers but uses more tokens.

4. **System Prompt:** The system message is crucial—it instructs the LLM to stay within bounds.

5. **API Costs:** Each embedding call and LLM call costs money. Monitor your usage.

---

## Security

- **Never commit `.env` to Git.** Add it to `.gitignore`:
  ```
  .env
  node_modules/
  ```
- Keep your OpenAI API key private
- Don't share your `.env` file with others

---

## Dependencies

- **[openai](https://www.npmjs.com/package/openai)** - Official OpenAI Node.js SDK
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Load environment variables from `.env` file

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `docs.txt not found` | Create a `docs.txt` file in the project root |
| `OPENAI_API_KEY is undefined` | Check your `.env` file and ensure the key is set correctly |
| `Model not found` | Verify you're using a valid OpenAI model name |
| `No relevant results` | Your question might not match the document content; try different wording |
| `Slow performance` | Large documents take longer to embed; consider splitting into smaller chunks |

---

## Learn More

- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [OpenAI Chat Completions](https://platform.openai.com/docs/guides/gpt)
- [RAG Concept](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)

---

## License

This project is licensed under the [MIT License](LICENSE).
---
Copyright© Aymane Mehdi