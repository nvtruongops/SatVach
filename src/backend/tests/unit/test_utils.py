from src.core.security import sanitize_input


class TestSecurityUtils:
    def test_sanitize_input_no_html(self):
        """Test sanitizing plain text."""
        text = "Hello World"
        assert sanitize_input(text) == "Hello World"

    def test_sanitize_input_strip_tags(self):
        """Test stripping HTML tags."""
        text = "<script>alert('xss')</script>Hello<b>World</b>"
        # Expect tags to be removed, content preserved (bleach strip=True behavior)
        # Note: bleach.clean with strip=True removes the tags but keeps content unless it's script/style styles usually?
        # Let's verify standard bleach behavior for allowed_tags=[]
        # By default bleach doesn't strip script content if not specified?
        # Actually our security.py uses bleach.clean(strip=True).
        # bleach documentation says strip=True strips markup but keeps content.
        # However, bleach usually escapes characters.
        # Let's check the implementation of security.py again:
        # return bleach.clean(text, tags=[], attributes={}, strip=True)
        # If text is "<script>alert('xss')</script>", bleach(strip=True) -> "alert('xss')"
        # This might not be what we want (executing code displayed as text), but for XSS in HTML context, it disables the tag.
        # Ideally we want to remove the script tag entirely or escape it.

        sanitized = sanitize_input(text)
        assert "<script>" not in sanitized
        assert "<b>" not in sanitized
        assert "alert('xss')" in sanitized  # Bleach strip=True keeps the inner text
        assert "Hello" in sanitized
        assert "World" in sanitized

    def test_sanitize_input_none(self):
        """Test handling None input."""
        assert sanitize_input(None) == ""
