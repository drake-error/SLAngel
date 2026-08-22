"""SLAngel — Test Suite: Auth System"""

import sys
import os
import pytest
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.auth.auth import hash_password, verify_password, create_access_token, decode_token


class TestPasswordHashing:
    def test_hash_password(self):
        hashed = hash_password("test_password123")
        assert hashed is not None
        assert hashed != "test_password123"
        assert len(hashed) > 20

    def test_verify_correct_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_different_hashes_for_same_password(self):
        hash1 = hash_password("same_password")
        hash2 = hash_password("same_password")
        # bcrypt generates different salts each time
        assert hash1 != hash2
        # But both should verify
        assert verify_password("same_password", hash1) is True
        assert verify_password("same_password", hash2) is True


class TestJWTTokens:
    def test_create_token(self):
        token = create_access_token(data={"sub": "testuser", "role": "OFFICER"})
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 20

    def test_decode_valid_token(self):
        token = create_access_token(data={"sub": "testuser", "role": "ADMIN"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "testuser"
        assert payload["role"] == "ADMIN"

    def test_decode_invalid_token(self):
        payload = decode_token("invalid.token.string")
        assert payload is None

    def test_token_contains_expiry(self):
        token = create_access_token(data={"sub": "testuser"})
        payload = decode_token(token)
        assert "exp" in payload
