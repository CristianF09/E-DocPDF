from transformers import pipeline

# Lazy-loaded translator; model choice can be tuned for languages needed
_translator = None


def _get_translator():
    global _translator
    if _translator is None:
        try:
            _translator = pipeline('translation', model='Helsinki-NLP/opus-mt-en-ro')
        except Exception:
            # Fallback to any available translation model
            _translator = pipeline('translation')
    return _translator


def translate_text(text: str, target_lang: str = 'ro') -> str:
    translator = _get_translator()
    # transformers pipelines often accept src-target in model naming; we assume model handles target
    out = translator(text, max_length=1000)
    if isinstance(out, list) and 'translation_text' in out[0]:
        return out[0]['translation_text']
    # different pipeline return key
    return out[0].get('translated_text') or str(out[0])
