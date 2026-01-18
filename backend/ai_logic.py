import sys
import json
# We need to make sure these libraries are installed: pip3 install sumy nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer

def analyze_text(text):
    try:
        # 1. Setup the parser
        # We use the "english" tokenizer
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        
        # 2. Summarize (TextRank Algorithm)
        summarizer = TextRankSummarizer()
        
        # Get 2 sentences for the summary
        summary_sentences = summarizer(parser.document, 2) 
        
        # Convert the sentence objects back to a string
        summary = " ".join([str(s) for s in summary_sentences])

        # Fallback: If text is too short to summarize, just return the text itself
        if not summary:
            summary = text

        # 3. Simple Keyword Extraction (Get top 5 words longer than 6 chars)
        words = text.split()
        keywords = sorted(list(set([w for w in words if len(w) > 6])), key=len, reverse=True)[:5]

        # 4. Return Data as JSON
        result = {
            "summary": summary,
            "keywords": keywords
        }
        print(json.dumps(result))

    except Exception as e:
        # If anything goes wrong, return the error so we can see it in Node
        error_result = {
            "summary": "Error in Python script",
            "keywords": [str(e)]
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    # Get the text input from Node.js (passed as an argument)
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        analyze_text(input_text)
    else:
        print(json.dumps({"summary": "No text provided", "keywords": []}))