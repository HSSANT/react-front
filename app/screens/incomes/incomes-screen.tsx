import React, { FC, useEffect, useReducer, useState } from "react"
import { Platform, StyleSheet } from "react-native"
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
import { useRecoilState } from "recoil"
import { allTransactionsState } from "../../recoil"
import { FAB } from "react-native-elements"
import { DateSingleInput } from "@datepicker-react/styled"

const iconDown = () => <AntDesign name="down" size={24} color={color.palette.white} />
const isWeb = Platform.OS === "web"
const styles = StyleSheet.create({
  buttonAddExpense: {
    alignItems: "center",
    bottom: 30,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    right: 30,
    width: 50,
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

export const IncomesScreen: FC<StackScreenProps<NavigatorParamList, "incomes">> = observer(
  ({ navigation }) => {
    const [allTransactions, setAllTransactions] = useRecoilState(allTransactionsState)
    const { authenticationStore } = useStores()
    const { transactionStore } = useStores()
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [formattedDate, setFormattedDate] = useState("")
    const [fetchedData, setFetchedData] = useState([])
    const [state, dispatch] = useReducer(reducer, initialState)
    useEffect(() => {
      const stringMonth = returnStringMonth(selectedDate.getMonth())
      loadString("id").then((storeUserId) => {
        transactionStore
          .transactionsFiltered(Number(storeUserId), selectedDate)
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
              .filter((item) => item.type === "income" && item.authorized == 1)
              .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
            setFetchedData(dataFilter)
          })
      })
      setFormattedDate(`${stringMonth}, ${selectedDate.getFullYear()}`)
    }, [selectedDate])

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
        <CardItem header={""} value={""}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>{formattedDate}</Text>
            {iconDown()}
          </TouchableOpacity>
        </CardItem>
        <TransactionsList title={""} data={fetchedData} />
        <FAB
          style={styles.buttonAddExpense}
          icon={{ name: "add", color: color.palette.white }}
          onPress={handleClickAddExpense}
          color={color.primary}
          size={"large"}
        ></FAB>
      </Screen>
    )
  },
)
