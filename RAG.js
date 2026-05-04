// ==========================
// STEP 0: IMPORTS
// ==========================

// Load environment variables from .env
import "dotenv/config";

// OpenAI SDK
import OpenAI from "openai";

// Read files from the system
import fs from "fs";

// Create CLI input/output
import readline from "readline";

// ==========================
// STEP 1: CREATE OPENAI CLIENT
// ==========================

// This creates the connection with the OpenAI API
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==========================
// STEP 2: READ DOCUMENT
// ==========================

// Read docs.txt file
// The file must exist in the same folder as this app
const documentText = fs.readFileSync("docs.txt", "utf-8");

// Now documentText is a string that contains all the text

// ==========================
// STEP 3: SPLIT INTO CHUNKS
// ==========================

// Split the document text into small pieces called chunks
const chunks = documentText
  .split(".") // Split text by period
  .map((c) => c.trim()) // Remove extra spaces
  .filter(Boolean); // Remove empty chunks

// Example:
// "A. B." → ["A", "B"]

// ==========================
// STEP 4: CREATE EMBEDDING FUNCTION
// ==========================

// This function converts any text into an embedding
// An embedding is an array of numbers that represents the meaning of the text
async function createEmbedding(text) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

// ==========================
// STEP 5: SIMILARITY FUNCTION
// ==========================

// This function compares two vectors
// It tells us how similar they are
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ==========================
// STEP 6: EMBED ALL CHUNKS ONCE
// ==========================

// Convert every chunk into an embedding
const chunkEmbeddings = [];

for (const chunk of chunks) {
  const embedding = await createEmbedding(chunk);

  chunkEmbeddings.push({
    text: chunk, // Original text
    embedding: embedding, // Vector numbers
  });
}

// Now we have a small in-memory vector database

// ==========================
// STEP 7: CREATE CLI INTERFACE
// ==========================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ==========================
// STEP 8: ASK USER QUESTION
// ==========================

rl.question("Ask a question: ", async (question) => {
  // ==========================
  // STEP 9: EMBED QUESTION
  // ==========================

  // Convert the user's question into an embedding
  const questionEmbedding = await createEmbedding(question);

  // ==========================
  // STEP 10: FIND BEST MATCHES
  // ==========================

  // Compare the question embedding with every chunk embedding
  const results = chunkEmbeddings
    .map((item) => ({
      text: item.text,
      score: cosineSimilarity(questionEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score) // Sort from most similar to least similar
    .slice(0, 2); // Take the best 2 chunks

  // ==========================
  // STEP 11: BUILD CONTEXT
  // ==========================

  // Join the best chunks into one context text
  const context = results.map((r) => r.text).join("\n");

  // context = the most relevant text for the question

  // ==========================
  // STEP 12: ASK THE LLM WITH CONTEXT
  // ==========================

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "Answer ONLY using the provided context. If the answer is not in the context, say you don't know.",
      },
      {
        role: "user",
        content: `
Context:
${context}

Question:
${question}
        `,
      },
    ],
  });

  // ==========================
  // STEP 13: PRINT ANSWER
  // ==========================

  console.log("\nAnswer:");
  console.log(completion.choices[0].message.content);

  // ==========================
  // STEP 14: CLOSE CLI
  // ==========================

  rl.close();
});
