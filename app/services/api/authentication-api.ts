import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { LoginResult, LogoutResult } from "./api.types"

export class AuthenticationApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `${this.api.config.url}/api/auth/login`,
        {
          email,
          password,
        },
      )
      let problem = getGeneralApiProblem(response)
      if (problem) return problem
      this.api.apisauce.deleteHeader("Authorization");
      this.api.apisauce.setHeader("Authorization", "Bearer " + response.data.access_token);
      return { kind: "ok", response }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async register(email: string, password: string, name: string): Promise<LoginResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/api/Authentication/sign-up",
        {
          email,
          password,
          name,
        },
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.patch(
        "/api/Authentication/log-out",
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
