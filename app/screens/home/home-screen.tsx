import React, { FC, useEffect, useReducer, useRef, useState } from "react"
import { StyleSheet, Platform } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { CardItem, Screen, Text, TransactionsList } from "../../components"
import { color, spacing } from "../../theme"
import { NavigatorParamList } from "../../navigators"
import { AntDesign } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native-gesture-handler"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { returnStringMonth } from "../../utils/return-string-month"
import { useStores } from "../../models"
import { loadString } from "../../utils/storage"
import { useRecoilState, useRecoilValue } from "recoil"
import { allTransactionsState, balance, incomeTotal, expenseTotal } from "../../recoil"
import { formatter } from "../../utils/currency-formatter"
import { DateSingleInput, OnDatesChangeProps, START_DATE } from "@datepicker-react/styled"
import { RootStore, RootStoreProvider, setupRootStore } from "../../models"

const iconDown = () => <AntDesign name="down" size={24} color={color.palette.white} />
const iconPlus = () => <AntDesign name="plus" size={24} color={color.primary} />
const isWeb = Platform.OS === "web"
const styles = StyleSheet.create({
  balanceButton: {
    alignItems: "center",
    minWidth: 128,
    width: "50%",
  },
  balanceButtonText: {
    fontSize: 15,
  },
  container: {
    backgroundColor: color.palette.white,
  },
  dateButton: {
    alignItems: "center",
    flexDirection: "row",
  },
  dateButtonText: {
    color: color.palette.white,
    fontSize: 18,
    marginRight: spacing[2],
  },
})

const initialState = {
  date: null,
  showDatepicker: false,
}

function reducer(state, action) {
  switch (action.type) {
    case "focusChange":
      return { ...state, showDatepicker: action.payload }
    case "dateChange":
      return action.payload
    default:
      throw new Error()
  }
}

export const HomeScreen: FC<StackScreenProps<NavigatorParamList, "BNB Bank">> = observer(
  ({ route, navigation }) => {
    const [allTransactions, setAllTransactions] = useRecoilState(allTransactionsState)
    const { authenticationStore } = useStores()
    const [state, dispatch] = useReducer(reducer, initialState)

    const balanceValue = useRecoilValue(balance)
    const incomeValue = useRecoilValue(incomeTotal)
    const expenseValue = useRecoilValue(expenseTotal)
    const { transactionStore } = useStores()
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [formattedDate, setFormattedDate] = useState("")
    const [fetchedData, setFetchedData] = useState([])
    console.log('home screen');
    const shouldRefresh = route?.params
    useEffect(() => {
      console.log('chegou no useEffect');
          const stringMonth = returnStringMonth(selectedDate.getMonth())
          loadString("id").then((storedUserName) => {
            transactionStore
              .transactionsFiltered(Number(storedUserName), selectedDate)
              .then((data: any) => {
                if ((data as any)?.kind == "token-expired") {
                  authenticationStore.logout()
                }
                if ((data as any)?.kind) {
                  return
                }
                setAllTransactions(data)
                const dataFilter = data
                  .filter((item: any) => {
                    return new Date(item.created_at).getMonth() >= selectedDate.getMonth()
                  })
                  .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
                setFetchedData(
                  dataFilter.filter(
                    (item) =>
                      (item.type == "income" && item.authorized == 1) || item.type == "expense",
                  ),
                )
              })
          })
          setFormattedDate(`${stringMonth}, ${selectedDate.getFullYear()}`)
    }, [selectedDate, incomeValue, expenseValue, shouldRefresh])

    const showDatePicker = () => {
      setDatePickerVisibility(true)
    }

    const hideDatePicker = () => {
      setDatePickerVisibility(false)
    }

    const handleConfirm = (date: Date) => {
      setSelectedDate(date)
      hideDatePicker()
    }
    const handleClickAddExpense = () => {
      navigation.navigate("Purchase")
    }
    const handleClickAddCheck = () => {
      navigation.navigate("Check")
    }
    const returnDatePickerNative = () => {
      return (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      )
    }
    const returnDatePickerWeb = () => {
      return (
        <>
          <DateSingleInput
            onDateChange={(data) => handleConfirm(data.date)}
            onFocusChange={(focusedInput) =>
              dispatch({ type: "focusChange", payload: focusedInput })
            }
            date={selectedDate} // Date or null
            showDatepicker={isDatePickerVisible} // Boolean
            onClose={hideDatePicker}
          />
        </>
      )
    }

    return (
      <Screen style={styles.container} backgroundColor={color.transparent} unsafe>
        <div style={{ zIndex: 99, display: isDatePickerVisible ? "" : "none" }}>
          {isWeb ? returnDatePickerWeb() : returnDatePickerNative()}
        </div>
        <CardItem header={"Current balance"} value={`${formatter.format(balanceValue)}`}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>{formattedDate}</Text>
            {iconDown()}
          </TouchableOpacity>
        </CardItem>
        <CardItem
          style={{ backgroundColor: color.tertiary }}
          header={"Incomes"}
          value={formatter.format(incomeValue)}
          textStyle={{ color: color.primary }}
        >
          <TouchableOpacity style={styles.balanceButton} onPress={handleClickAddCheck}>
            {iconPlus()}
            <Text style={styles.balanceButtonText} text="Deposit a check" />
          </TouchableOpacity>
        </CardItem>
        <CardItem
          style={{ backgroundColor: color.quaternary }}
          header={"Expenses"}
          value={formatter.format(expenseValue)}
          textStyle={{ color: color.primary }}
        >
          <TouchableOpacity style={styles.balanceButton} onPress={handleClickAddExpense}>
            {iconPlus()}
            <Text style={styles.balanceButtonText} text="Purchase" />
          </TouchableOpacity>
        </CardItem>
        <TransactionsList title={"TRANSACTIONS"} data={fetchedData} />
      </Screen>
    )
  },
)
