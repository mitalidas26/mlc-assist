import json
import re
import math
from pathlib import Path
from typing import List, Dict, Any, Tuple

CORPUS_PATH = Path(__file__).resolve().parent / "bns_corpus.json"

class BNSRetriever:
    def __init__(self):
        with open(CORPUS_PATH, "r", encoding="utf-8") as f:
            self.corpus = json.load(f)
        self._init_bm25()

    def _tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        text = text.lower()
        return re.findall(r"\b[a-z0-9_]{2,}\b", text)

    def _init_bm25(self):
        self.doc_count = len(self.corpus)
        self.doc_lengths = []
        self.doc_term_freqs = []
        self.df = {}

        for doc in self.corpus:
            combined_text = " ".join([
                doc.get("title", ""),
                doc.get("statutory_text", ""),
                " ".join(doc.get("keywords", [])),
                doc.get("clinical_criteria", ""),
                doc.get("category", "")
            ])
            tokens = self._tokenize(combined_text)
            self.doc_lengths.append(len(tokens))
            
            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            self.doc_term_freqs.append(tf)

            for unique_t in tf.keys():
                self.df[unique_t] = self.df.get(unique_t, 0) + 1

        self.avg_doc_len = sum(self.doc_lengths) / max(1, self.doc_count)

    def search(self, query: str, top_k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        k1 = 1.5
        b = 0.75
        scores = []

        for idx, doc in enumerate(self.corpus):
            score = 0.0
            doc_len = self.doc_lengths[idx]
            tf_dict = self.doc_term_freqs[idx]

            for token in query_tokens:
                if token in tf_dict:
                    freq = tf_dict[token]
                    doc_freq = self.df.get(token, 1)
                    idf = math.log(1 + (self.doc_count - doc_freq + 0.5) / (doc_freq + 0.5))
                    numerator = freq * (k1 + 1)
                    denominator = freq + k1 * (1 - b + b * (doc_len / self.avg_doc_len))
                    score += idf * (numerator / max(0.0001, denominator))

            # Bonus for direct keyword matches
            keywords = [k.lower() for k in doc.get("keywords", [])]
            for q_term in query_tokens:
                if any(q_term in kw for kw in keywords):
                    score += 1.5

            if score > 0:
                scores.append((doc, round(score, 3)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]
