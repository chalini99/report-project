from transformers import T5ForConditionalGeneration, T5Tokenizer

from app.config import MODEL_NAME

# Singleton cache
_model: T5ForConditionalGeneration | None = None
_tokenizer: T5Tokenizer | None = None


def get_tokenizer() -> T5Tokenizer:
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
    return _tokenizer


def get_model() -> T5ForConditionalGeneration:
    global _model
    if _model is None:
        _model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
    return _model


def _summarize(prefix: str, text: str) -> str:
    tokenizer = get_tokenizer()
    model = get_model()

    input_text = f"{prefix}{text}"
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True,
    )
    output_ids = model.generate(inputs["input_ids"], max_new_tokens=150)
    return tokenizer.decode(output_ids[0], skip_special_tokens=True)


def generate_patient_summary(text: str) -> str:
    return _summarize("summarize for patient: ", text)


def generate_clinical_summary(text: str) -> str:
    return _summarize("clinical summary: ", text)
