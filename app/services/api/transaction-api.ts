import { ApiResponse } from "apisauce"
import { saveString } from "../../utils/storage"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { TransactionsResult, TransactionResult } from "./api.types"

export class TransactionApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async transactionDetail(id: string): Promise<TransactionResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get("/Transaction/detail", {
        id,
      })

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", ...JSON.parse(response.data) }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async newPurchase(data: any): Promise<TransactionResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "api/account/Transaction/new",
        {
          ...data,
        },
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const { transactions } = response.data

      return { kind: "ok", transaction: { ...transactions } }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async newIncome(data: any): Promise<TransactionResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "api/account/Transaction/new",
        {
          ...data,
        },
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const { transactions } = response.data

      return { kind: "ok", transaction: { ...transactions } }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async transactionsFiltered(userId: number, dateFormat: Date): Promise<TransactionsResult> {
    try {
      var dt = new Date(dateFormat)
      dt.setHours(0, 0, 0)
      var date = new Date(dt).toLocaleDateString("en-CA")
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/api/account/Transaction/filtered",
        {
          userId,
          date,
        },
      )
      const transactions = response.data
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      console.log("chegou aqui no transactions")
      console.log(transactions)
      return { kind: "ok", transactions: transactions }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async transactionUpdate(id: number, authorized: boolean): Promise<TransactionsResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/api/account/Transaction/update",
        {
          id,
          authorized,
        },
      )
      const { transactions } = response.data
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", transactions: transactions }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async transactionsPending(): Promise<TransactionsResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/api/account/Transaction/pending",
      )
      const { data } = response
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", transactions: data }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
