from tenant.handlers.set_tenant import set_tenant

from payments.models import PaymentTransactions
from accounting.models import Allocation, CashFlow
from bookkeeping.models import *
from bookkeeping.choices import *
from datetime import datetime
from loan.models import ApprovedLoan
from accounting.handlers.allocate_cashflows import AllocationCashFlows

set_tenant("transwarranty-uat")

pmt = PaymentTransactions.objects.get(payment_transaction_id='test-transaction-id-1211145') 