import React, { FC, useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { Screen, TransactionsList } from "../../../components"
import { color } from "../../../theme"
import { NavigatorParamList } from "../../../navigators/stacks"
import { returnStringMonth } from "../../../utils/return-string-month"
import { useStores } from "../../../models"
import { loadString } from "../../../utils/storage"
import { useRecoilState } from "recoil"
import { allTransactionsState, selectedDateState } from "../../../recoil"

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.palette.white,
  },
})

export const IncomesTab: FC<StackScreenProps<NavigatorParamList, "Incomes">> = observer(
  ({ route }) => {
    const currentTab = route?.params.currentTab
    const [setAllTransactions] = useRecoilState(allTransactionsState)
    const [selectedDate] = useRecoilState(selectedDateState)
    const { transactionStore } = useStores()
    const [setFormattedDate] = useState("")
    const [fetchedData, setFetchedData] = useState([])
    useEffect(() => {
      const stringMonth = returnStringMonth(selectedDate.getMonth())
      loadString("id").then((storedUserId) => {
        transactionStore
          .transactionsFiltered(Number(storedUserId), selectedDate)
          .then((data: any) => {
            setAllTransactions(data)
            const dataFilter = data
              .filter((item: any) => {
                return (
                  Number(new Date(item.created_at).getMonth()) === Number(selectedDate.getMonth())
                )
              })
              .filter(
                (item) =>
                  item.type === "income" &&
                  item.authorized ==
                    (currentTab == "REJECTED" ? 0 : currentTab == "ACCEPTED" ? 1 : null),
              )
              .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
            setFetchedData(dataFilter)
          })
      })
      setFormattedDate(`${stringMonth}, ${selectedDate.getFullYear()}`)
    }, [selectedDate])

    return (
      <Screen style={styles.container} unsafe>
        <TransactionsList title={""} data={fetchedData} />
      </Screen>
    )
  },
)
