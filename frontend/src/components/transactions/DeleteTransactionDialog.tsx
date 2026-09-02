"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Transaction } from "@/types/transaction";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isDeleting: boolean;
}

export default function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteTransactionDialogProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Transaction</h3>
              <p className="text-xs text-graphite-400">Soft delete transaction record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-graphite-300">
          Are you sure you want to soft-delete transaction{" "}
          <span className="font-semibold text-gold-400">
            {transaction.transaction_id} (${transaction.amount.toFixed(2)})
          </span>
          ? This record will be archived.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-graphite-800 hover:bg-graphite-700 text-graphite-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(transaction.id)}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
          >
            {isDeleting ? <span>Deleting...</span> : <span>Confirm Soft Delete</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
