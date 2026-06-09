import re

NAME_MAX_LENGTH = 20
NAME_PATTERN = re.compile(r"^[A-Za-z0-9 _\-']{1,20}$")

BANNED_WORDS = [
    "fuck", "fucking", "fucker", "shit", "shitty", "bitch", "asshole", "ass",
    "bastard", "damn", "dick", "piss", "crap", "sex", "porn", "porno", "nsfw",
    "nude", "nudes", "boob", "boobs", "tits", "penis", "vagina", "cum",
    "nigger", "nigga", "beaner", "hitler", "nazi", "kill", "murder", "rape",
]


def normalize_name(name: str) -> str:
    normalized = name.lower().replace(" ", "").replace("-", "").replace("_", "")
    normalized = normalized.replace("1", "i").replace("3", "e").replace("4", "a").replace("0", "o")
    return normalized


def validate_name(name: str) -> dict:
    value = (name or "").strip()
    if not value:
        return {"valid": False, "error": "Name cannot be empty", "sanitized_name": None}

    if len(value) > NAME_MAX_LENGTH:
        return {"valid": False, "error": f"Name must be at most {NAME_MAX_LENGTH} characters", "sanitized_name": None}

    if not NAME_PATTERN.match(value):
        return {
            "valid": False,
            "error": "Use 1-20 characters: letters, numbers, space, -, _, '.",
            "sanitized_name": None,
        }

    normalized = normalize_name(value)
    for word in BANNED_WORDS:
        if word in normalized:
            return {"valid": False, "error": "Name contains reserved content.", "sanitized_name": None}

    if re.search(r"(.)\1{6,}", value):
        return {"valid": False, "error": "Please avoid long repeated characters.", "sanitized_name": None}

    return {"valid": True, "error": None, "sanitized_name": value}
