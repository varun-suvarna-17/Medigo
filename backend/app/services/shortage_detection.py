def is_shortage_risk(current_stock: float, avg_daily_consumption: float, days_threshold: int = 7) -> bool:
    """Rule-based shortage check: flag if stock runs out within threshold days."""
    if avg_daily_consumption <= 0:
        return False
    days_remaining = current_stock / avg_daily_consumption
    return days_remaining <= days_threshold
