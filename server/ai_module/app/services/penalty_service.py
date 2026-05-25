RANGES = {
    "no_damage": (0.0, 0.0),
    "minor": (0.05, 0.15),
    "major": (0.20, 0.40),
    "critical": (0.50, 1.00),
}


def calculate_penalty(damage_level: str, item_price: float) -> dict:
    normalized_level = damage_level.strip().lower()
    if normalized_level not in RANGES:
        raise ValueError(f"Unsupported damage level: {damage_level}")

    min_ratio, max_ratio = RANGES[normalized_level]
    min_penalty = round(item_price * min_ratio, 2)
    max_penalty = round(item_price * max_ratio, 2)
    penalty_amount = round((min_penalty + max_penalty) / 2, 2)

    return {
        "penalty_amount": penalty_amount,
        "penalty_range": [min_penalty, max_penalty],
    }
