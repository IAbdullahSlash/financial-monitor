from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


class EncryptionService:
    def __init__(self) -> None:
        key = settings.encryption_key
        if key == "change-me-use-fernet-key":
            key = Fernet.generate_key().decode()
        try:
            self._fernet = Fernet(key.encode())
        except Exception:
            self._fernet = Fernet(Fernet.generate_key())

    def encrypt(self, plaintext: str) -> str:
        return self._fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, encrypted_text: str) -> str:
        try:
            return self._fernet.decrypt(encrypted_text.encode()).decode()
        except InvalidToken as exc:
            raise ValueError("Invalid encrypted payload") from exc


encryption_service = EncryptionService()
