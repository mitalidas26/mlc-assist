from fastapi import APIRouter, Query
from typing import List, Dict, Any

from ..legal_rag.retriever import BNSRetriever

router = APIRouter(prefix="/legal", tags=["Legal Corpus"])
retriever = BNSRetriever()

@router.get("/bns-clauses", response_model=List[Dict[str, Any]])
def get_all_bns_clauses():
    """Returns the full indexed corpus of BNS Hurt and Grievous Hurt statutory clauses"""
    return retriever.corpus

@router.get("/search", response_model=List[Dict[str, Any]])
def search_bns_clauses(q: str = Query(..., description="Clinical injury query or legal term")):
    """Searches BNS clauses using BM25 keyword + semantic ranking"""
    results = retriever.search(q, top_k=5)
    return [
        {
            "clause": doc,
            "relevance_score": score
        }
        for doc, score in results
    ]
