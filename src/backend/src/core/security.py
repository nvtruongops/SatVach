"""
SatVach Security Utilities.
Handles input sanitization and other security functions.
"""

import bleach

# Allowed HTML tags for description field (if we allow rich text later)
# For now, we strip mostly everything to be safe.
ALLOWED_TAGS = []  # No HTML allowed by default
ALLOWED_ATTRIBUTES = {}


def sanitize_input(text: str) -> str:
    """
    Sanitize input text to prevent XSS.
    Removes all HTML tags and script injection attempts.

    Args:
        text: Input string (can be None)

    Returns:
        Sanitized string using bleach
    """
    if not text:
        return ""

    return bleach.clean(text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
