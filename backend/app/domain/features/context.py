from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from app.models.customer import Customer
from app.models.device import Device
from app.models.merchant import Merchant
from app.models.transaction import Transaction


@dataclass
class FeatureContext:
    transaction: Transaction
    merchant: Optional[Merchant] = None
    customer: Optional[Customer] = None
    device: Optional[Device] = None
    recent_customer_transactions: List[Transaction] = field(default_factory=list)
    recent_device_transactions: List[Transaction] = field(default_factory=list)
    recent_merchant_transactions: List[Transaction] = field(default_factory=list)
    execution_time: datetime = field(default_factory=datetime.utcnow)
