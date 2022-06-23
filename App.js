// This is the first file that ReactNative will run when it starts up.
import App from "./app/app.tsx"
import { registerRootComponent } from "expo"
import { createServer, Model } from "miragejs"
import { LogBox } from "react-native"

LogBox.ignoreLogs(["Reanimated 2", "Unable to symbolicate", "Setting a timer"])

if (window.server) {
  server.shutdown()
}

window.server = createServer({
  models: {
    users: Model,
    transactions: Model,
  },
  seeds(server) {
    server.schema.users.create({
      userName: "alegentil",
      email: "herbert.aga@gmail.com",
      password: "123456",
    })
    server.schema.users.create({
      userName: "adm",
      email: "adm@gmail.com",
      password: "12345678",
      admin: "true",
    })
    server.schema.transactions.create({
      // id: "3",
      value: "3200",
      date: "2021-10-24T23:42:22.200Z",
      type: "expense",
      description: "t-shirt",
      userName: "alegentil",
      email: "herbert.aga@gmail.com",
      idUser: "1",
      state: "approved",
    })
    server.schema.transactions.create({
      // id: "4",
      value: "3300",
      date: "2021-10-26T23:42:22.200Z",
      type: "expense",
      description: "t-shirt",
      userName: "alegentil",
      email: "herbert.aga@gmail.com",
      idUser: "1",
      state: "approved",
    })
    server.schema.transactions.create({
      // id: "5",
      value: "15000",
      date: "2021-10-13T23:42:22.200Z",
      type: "income",
      incomeType: "check",
      description: "salary",
      userName: "alegentil",
      email: "herbert.aga@gmail.com",
      idUser: "1",
      state: "approved",
    })
    server.schema.transactions.create({
      // id: "5",
      value: "1500",
      date: "2021-10-13T23:42:22.200Z",
      type: "income",
      incomeType: "check",
      description: "FII",
      userName: "alegentil",
      email: "herbert.aga@gmail.com",
      idUser: "1",
      state: "pending",
    })
  },
  routes() {
    this.namespace = "api"
    this.urlPrefix = process.env.API_URL
    this.post("/auth/login", (response, request) => {
      return {
        response: { response },
        kind: "ok",
      }
    })

    this.get("/api/Authentication/get", (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      const { email } = attrs
      const user = schema.users.findBy({ email })

      return {
        ...user,
        kind: "ok",
      }
    })

    this.post("/api/Authentication/sign-up", (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      const { email, userName } = attrs

      if (schema.users.where({ email }).models.length > 0) {
        throw new Error("Email already exists")
      }
      if (schema.users.where({ userName }).models.length > 0) {
        throw new Error("User already exists")
      }
      return schema.users.create(attrs)
    })

    this.post("/api/Transaction/filtered", (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      const { userName } = attrs
      const { models: transactions } = schema.transactions.where(
        (transaction) => transaction.userName === userName,
      )
      if (!transactions) {
        throw new Error("No transactions found")
      }
      return {
        transactions: transactions,
        kind: "ok",
      }
    })

    this.post("/api/account/Transaction/pending", (schema, request) => {
      const { models: transactions } = schema.transactions.where(
        (transaction) => transaction.authorized === false,
      )
      if (!transactions) {
        throw new Error("No transactions found")
      }

      return {
        transactions: transactions,
        kind: "ok",
      }
    })

    this.get("/api/Transaction/detail", (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      const { id } = attrs
      const transaction = schema.transactions.findBy({ id })
      if (!transaction) {
        throw new Error("No transaction found")
      }

      return {
        ...transaction,
        kind: "ok",
      }
    })

    this.post("/api/Transaction/update", (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      const { id, state } = attrs
      const transaction = schema.transactions.findBy({ id })
      if (!transaction) {
        throw new Error("No transaction found")
      }
      transaction.update({ state: state })
      return {
        ...transaction,
        kind: "ok",
      }
    })

    this.post("/api/Transaction/new", (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      return schema.transactions.create(attrs)
    })
  },
})
window.server.shutdown()
registerRootComponent(App)
export default App
