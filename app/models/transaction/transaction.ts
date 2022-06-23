import { Instance, SnapshotOut, types } from "mobx-state-tree"

        // 'user_id', 'description', 'authorized_by', 'authorized','amount','checkbook_image','created_at',


export const TransactionModel = types.model("Transaction").props({
  id: types.maybe(types.number),
  created_at: types.maybe(types.string),
  amount: types.maybe(types.number),
  authorized_by: types.maybe(types.string), 
  description: types.maybe(types.string),
  type: types.maybe(types.string),
  user_id: types.maybe(types.integer),
  authorized: types.maybe(types.boolean),
  checkbook_image: types.maybe(types.string),
  user: types.model("User").props({
    id: types.maybe(types.number),
    created_at: types.maybe(types.string),
    email_verified_at: types.maybe(types.string),
    balance: types.maybe(types.string),
    name: types.maybe(types.string), 
    email: types.maybe(types.string),
  }),
})

type TransactionType = Instance<typeof TransactionModel>
export interface Transaction extends TransactionType {}
type TransactionSnapshotType = SnapshotOut<typeof TransactionModel>
export interface TransactionSnapshot extends TransactionSnapshotType {}
export const createTransactionDefaultModel = () => types.optional(TransactionModel, {})