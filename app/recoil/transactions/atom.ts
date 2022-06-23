import { atom, selector } from "recoil"
import { Transaction } from "../../models/transaction/transaction"

export const selectedDateState = atom({
  key: "selectedDateState",
  default: new Date(),
})

export const allTransactionsState = atom({
  key: "allTransactionsState",
  default: [],
})

export const selectedTransactionState = atom({
  key: "selectedTransactionState",
  default: {} as Transaction,
})

export const incomeTotal = selector({
  key: "incomeTotal",
  get: ({ get }) => {
    const transactions = get(allTransactionsState)
    if (transactions?.length === 0 || !transactions || (transactions as any)?.kind) return 0
    const income = transactions
      .filter(
        (transaction) =>
          transaction?.authorized !== null &&
          transaction?.authorized === 1 &&
          transaction.type === "income",
      )
      .reduce((accum, item) => accum + Number(item.amount), 0)
    return income || 0
  },
})

export const expenseTotal = selector({
  key: "expenseTotal",
  get: ({ get }) => {
    const transactions = get(allTransactionsState)
    if (transactions?.length === 0 || !transactions || (transactions as any)?.kind) return 0
    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((accum, item) => accum + Number(item.amount), 0)
    return expense || 0
  },
})

export const balance = selector({
  key: "balance",
  get: ({ get }) => {
    const income = get(incomeTotal)
    const expense = get(expenseTotal)
    const balance = Number(income) - Number(expense)
    return balance || 0
  },
})
