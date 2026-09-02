from datetime import datetime, timezone
import math
from typing import Any, Dict, List
from app.domain.features.base import BaseFeatureStrategy
from app.domain.features.context import FeatureContext
from app.domain.features.registry import FeatureRegistry


def _to_naive_utc(dt: datetime) -> datetime:
    """Normalize datetime to naive UTC for safe arithmetic."""
    if dt is None:
        return datetime.utcnow()
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class TransactionFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "transaction"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        txn = context.transaction
        dt = _to_naive_utc(txn.timestamp) if txn.timestamp else datetime.utcnow()

        return {
            "txn_amount": float(txn.amount),
            "txn_currency": txn.currency,
            "txn_hour": dt.hour,
            "txn_day_of_week": dt.weekday(),
            "txn_is_weekend": dt.weekday() in (5, 6),
            "txn_payment_method": txn.payment_method.value if hasattr(txn.payment_method, "value") else str(txn.payment_method),
            "txn_card_network": txn.card_network or "UNKNOWN",
            "txn_type": txn.transaction_type.value if hasattr(txn.transaction_type, "value") else str(txn.transaction_type),
        }


class CustomerFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "customer"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        cust = context.customer
        if not cust:
            return {
                "cust_ltv": 0.0,
                "cust_avg_txn_amount": 0.0,
                "cust_max_txn_amount": 0.0,
                "cust_refund_ratio": 0.0,
                "cust_chargeback_ratio": 0.0,
                "cust_successful_payments": 0,
                "cust_failed_payments": 0,
                "cust_days_since_last_txn": -1,
            }

        total = cust.total_transactions or 1
        days_since = -1
        if cust.last_transaction_date:
            last_dt = _to_naive_utc(cust.last_transaction_date)
            days_since = max(0, (datetime.utcnow() - last_dt).days)

        return {
            "cust_ltv": float(cust.lifetime_value),
            "cust_avg_txn_amount": float(cust.average_transaction_value),
            "cust_max_txn_amount": float(cust.highest_transaction_value),
            "cust_refund_ratio": round(cust.refunds / total, 4),
            "cust_chargeback_ratio": round(cust.chargebacks / total, 4),
            "cust_successful_payments": cust.successful_transactions,
            "cust_failed_payments": cust.failed_transactions,
            "cust_days_since_last_txn": days_since,
        }


class MerchantFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "merchant"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        m = context.merchant
        if not m:
            return {
                "merchant_age_days": 0,
                "merchant_reputation_score": 50.0,
                "merchant_approval_rate": 0.95,
                "merchant_chargeback_rate": 0.01,
                "merchant_refund_rate": 0.02,
                "merchant_daily_volume": 1000.0,
                "merchant_monthly_volume": 30000.0,
            }

        created_dt = _to_naive_utc(m.created_at) if m.created_at else datetime.utcnow()
        age_days = max(0, (datetime.utcnow() - created_dt).days)
        return {
            "merchant_age_days": age_days,
            "merchant_reputation_score": 90.0 if m.status.value == "Active" else 40.0,
            "merchant_approval_rate": 0.96,
            "merchant_chargeback_rate": 0.005,
            "merchant_refund_rate": 0.015,
            "merchant_daily_volume": 5000.0,
            "merchant_monthly_volume": 150000.0,
        }


class DeviceFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "device"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        dev = context.device
        if not dev:
            return {
                "dev_is_new": True,
                "dev_age_days": 0,
                "dev_vpn_detected": False,
                "dev_emulator_detected": False,
                "dev_rooted_detected": False,
                "dev_jailbroken_detected": False,
                "dev_failure_rate": 0.0,
                "dev_success_rate": 1.0,
            }

        first_dt = _to_naive_utc(dev.first_seen) if dev.first_seen else datetime.utcnow()
        dev_age = max(0, (datetime.utcnow() - first_dt).days)
        total_txns = dev.transaction_count or 1
        fail_rate = round(dev.failed_attempts / total_txns, 4)

        return {
            "dev_is_new": dev.transaction_count <= 1,
            "dev_age_days": dev_age,
            "dev_vpn_detected": dev.vpn_detected,
            "dev_emulator_detected": dev.emulator,
            "dev_rooted_detected": dev.rooted_device,
            "dev_jailbroken_detected": dev.jailbroken,
            "dev_failure_rate": fail_rate,
            "dev_success_rate": round(1.0 - fail_rate, 4),
        }


class VelocityFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "velocity"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        now = datetime.utcnow()
        recent_txns = context.recent_customer_transactions or context.recent_device_transactions

        t_1m = 0
        t_5m = 0
        t_1h = 0
        t_24h = 0
        fails_1h = 0
        card_bins = set()
        ips = set()

        for t in recent_txns:
            if not t.timestamp:
                continue
            t_dt = _to_naive_utc(t.timestamp)
            delta = (now - t_dt).total_seconds()
            if delta <= 60:
                t_1m += 1
            if delta <= 300:
                t_5m += 1
            if delta <= 3600:
                t_1h += 1
                if t.status.value in ("Failed", "Cancelled"):
                    fails_1h += 1
            if delta <= 86400:
                t_24h += 1

            if t.card_bin:
                card_bins.add(t.card_bin)
            if t.ip_address:
                ips.add(t.ip_address)

        return {
            "velocity_txns_1m": t_1m,
            "velocity_txns_5m": t_5m,
            "velocity_txns_1h": t_1h,
            "velocity_txns_24h": t_24h,
            "velocity_failed_attempts_1h": fails_1h,
            "velocity_multiple_cards_used": len(card_bins) > 1,
            "velocity_multiple_ips_used": len(ips) > 1,
        }


class BehaviourFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "behaviour"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        txn = context.transaction
        dt = _to_naive_utc(txn.timestamp) if txn.timestamp else datetime.utcnow()

        is_night = dt.hour >= 23 or dt.hour <= 5
        is_holiday = dt.month == 12 and dt.day in (24, 25, 31)

        is_first_merchant = len(context.recent_customer_transactions) == 0
        is_first_device = context.device.transaction_count <= 1 if context.device else True

        unusual_amount = False
        if context.customer and context.customer.average_transaction_value > 0:
            avg_val = float(context.customer.average_transaction_value)
            unusual_amount = float(txn.amount) > (avg_val * 3.0)

        return {
            "beh_first_time_merchant": is_first_merchant,
            "beh_first_time_device": is_first_device,
            "beh_unusual_amount": unusual_amount,
            "beh_is_night_txn": is_night,
            "beh_is_holiday_txn": is_holiday,
            "beh_different_browser": False,
            "beh_different_os": False,
        }


class LocationFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "location"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        txn = context.transaction
        cust = context.customer

        is_new_country = False
        if cust and cust.country:
            is_new_country = txn.country.lower() != cust.country.lower()

        high_risk_countries = {"north korea", "iran", "syria", "cuba", "sudan"}
        is_high_risk = txn.country.lower() in high_risk_countries

        return {
            "loc_is_new_country": is_new_country,
            "loc_is_new_city": False,
            "loc_distance_from_prev_txn_km": 0.0,
            "loc_impossible_travel_flag": False,
            "loc_is_high_risk_country": is_high_risk,
        }


class HistoricalFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "historical"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        recent = context.recent_customer_transactions
        if not recent:
            return {
                "hist_last_txn_amount": 0.0,
                "hist_prev_txn_gap_hours": -1.0,
                "hist_avg_daily_spend": float(context.transaction.amount),
                "hist_rolling_mean_7d": float(context.transaction.amount),
                "hist_rolling_std_7d": 0.0,
            }

        last_txn = recent[0]
        last_amount = float(last_txn.amount)

        gap_hours = -1.0
        if last_txn.timestamp and context.transaction.timestamp:
            t1 = _to_naive_utc(context.transaction.timestamp)
            t2 = _to_naive_utc(last_txn.timestamp)
            gap_hours = round((t1 - t2).total_seconds() / 3600.0, 2)

        amounts = [float(t.amount) for t in recent[:10]]
        mean_amt = sum(amounts) / len(amounts)
        variance = sum((x - mean_amt) ** 2 for x in amounts) / len(amounts)
        std_amt = round(math.sqrt(variance), 2)

        return {
            "hist_last_txn_amount": last_amount,
            "hist_prev_txn_gap_hours": gap_hours,
            "hist_avg_daily_spend": round(mean_amt, 2),
            "hist_rolling_mean_7d": round(mean_amt, 2),
            "hist_rolling_std_7d": std_amt,
        }


class PaymentFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "payment"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        txn = context.transaction
        is_intl = False
        if txn.currency.upper() != "USD":
            is_intl = True

        return {
            "pay_is_international_card": is_intl,
            "pay_is_prepaid_card": False,
            "pay_card_bin_country_match": True,
        }


class RiskFeatureStrategy(BaseFeatureStrategy):
    @property
    def group_name(self) -> str:
        return "risk"

    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        cust_flags = len(context.customer.risk_flags) if context.customer and context.customer.risk_flags else 0
        dev_flags = len(context.device.risk_flags) if context.device and context.device.risk_flags else 0
        vpn_risk = 1 if (context.device and context.device.vpn_detected) else 0

        raw_score = (cust_flags * 25.0) + (dev_flags * 20.0) + (vpn_risk * 30.0)

        return {
            "risk_customer_flag_count": cust_flags,
            "risk_device_flag_count": dev_flags,
            "risk_composite_raw_score": min(100.0, raw_score),
        }


def register_default_strategies():
    FeatureRegistry.register(TransactionFeatureStrategy())
    FeatureRegistry.register(CustomerFeatureStrategy())
    FeatureRegistry.register(MerchantFeatureStrategy())
    FeatureRegistry.register(DeviceFeatureStrategy())
    FeatureRegistry.register(VelocityFeatureStrategy())
    FeatureRegistry.register(BehaviourFeatureStrategy())
    FeatureRegistry.register(LocationFeatureStrategy())
    FeatureRegistry.register(HistoricalFeatureStrategy())
    FeatureRegistry.register(PaymentFeatureStrategy())
    FeatureRegistry.register(RiskFeatureStrategy())


register_default_strategies()
