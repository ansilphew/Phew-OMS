"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";

export default function AccountantInvoicesPage() {
  return (
    <ProtectedPage allowedRole="Accountant" title="Invoices Hub">
      <div className="rounded-xl border border-[#eef0f3] bg-white p-8 mt-6">
        <h2 className="text-lg font-bold text-[#1f1f1f] mb-2">Billing Invoices</h2>
        <p className="text-sm text-[#9a9a9a]">Generate, review, and track client billing invoices and outstanding balances.</p>
        
        <div className="mt-8 border border-dashed border-[#e2e8f0] rounded-xl p-12 text-center text-slate-400">
          No invoices registered. Click "New Invoice" to issue a client invoice.
        </div>
      </div>
    </ProtectedPage>
  );
}
