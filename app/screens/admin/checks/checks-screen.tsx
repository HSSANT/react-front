import React, { FC, useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { Screen, TransactionsListClickable } from "../../../components"
import { color, typography } from "../../../theme"
import { NavigatorParamList } from "../../../navigators"
import { setupRootStore, useStores } from "../../../models"
import { useRecoilState } from "recoil"
import { allTransactionsState, selectedTransactionState } from "../../../recoil"

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.palette.white,
  },
  text: {
    color: color.palette.white,
    fontFamily: typography.primary,
  },
})

export const ChecksScreen: FC<StackScreenProps<NavigatorParamList, "CHECKS CONTROL">> = observer(
  ({ navigation }) => {
    const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined)
    const { authenticationStore } = useStores()
    allTransactionsState
    const [allTransactions, setAllTransactions] = useRecoilState(allTransactionsState)
    const [selectedTransaction, setSelectedTransaction] = useRecoilState(selectedTransactionState)
    const { transactionStore } = useStores()
    const [fetchedData, setFetchedData] = useState([])
    const handleClickCheckDetail = (item: any) => {
      setSelectedTransaction(item)
      navigation.navigate("CheckDetails")
    }
    useEffect(() => {
      transactionStore.transactionsPending().then((data: any) => {
        if ((data as any)?.kind == "token-expired") {
          authenticationStore.logout()
        }
        if ((data as any)?.kind) {
          return
        }
        const dataFilter = data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
        setFetchedData(dataFilter)
      })
    }, [allTransactions])
    return (
      <Screen style={styles.container} unsafe>
        <TransactionsListClickable
          title={""}
          data={fetchedData}
          handleClick={handleClickCheckDetail}
        />
      </Screen>
    )
  },
)
