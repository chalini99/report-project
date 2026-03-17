import re

# Phone number patterns:
# +1-555-123-4567, 1-555-123-4567, 555-123-4567, (555) 123-4567, 5551234567
_PHONE_PATTERN = re.compile(
    r"""
    (?:\+?1[-.\s]?)?          # optional country code +1 or 1
    (?:\(\d{3}\)|\d{3})       # area code: (555) or 555
    [-.\s]?                   # separator
    \d{3}                     # exchange
    [-.\s]?                   # separator
    \d{4}                     # subscriber
    """,
    re.VERBOSE,
)

# Name patterns: lines/tokens starting with "Patient:" or "Name:" followed by a name
_NAME_PATTERN = re.compile(
    r"(?:Patient|Name)\s*:\s*[A-Za-z]+(?:\s+[A-Za-z]+)*",
    re.IGNORECASE,
)


def deidentify(text: str) -> str:
    """Remove PII (phone numbers and name labels) from text, replacing with [REDACTED]."""
    text = _NAME_PATTERN.sub("[REDACTED]", text)
    text = _PHONE_PATTERN.sub("[REDACTED]", text)
    return text
