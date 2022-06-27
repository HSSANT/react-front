import React, { FC, useEffect, useReducer, useState } from "react"
import { Platform, StyleSheet } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { CardItem, Icon, Screen, Text } from "../../components"
import { color, spacing } from "../../theme"
import { NavigatorParamList } from "../../navigators"
import { TouchableOpacity } from "react-native-gesture-handler"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { returnStringMonth } from "../../utils/return-string-month"
import { useStores } from "../../models"
import { useRecoilState } from "recoil"
import { allTransactionsState, selectedDateState } from "../../recoil"
import { FAB } from "react-native-elements"
import { NavigationContainer } from "@react-navigation/native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { IncomesTab } from "./incomes/incomes-tab"
import { DateSingleInput } from "@datepicker-react/styled"
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

const Tab = createMaterialTopTabNavigator()
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
export const ChecksScreen: FC<StackScreenProps<NavigatorParamList, "checks">> = observer(
  ({ navigation }) => {
    const [allTransactions, setAllTransactions] = useRecoilState(allTransactionsState)
    const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState)
    const { transactionStore } = useStores()
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [formattedDate, setFormattedDate] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
      const stringMonth = returnStringMonth(selectedDate.getMonth())
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
        <CardItem header={""} value={""}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>{formattedDate}</Text>
            <Icon type="ant-design" name="down" color={color.palette.white} />
          </TouchableOpacity>
        </CardItem>
        <NavigationContainer independent>
          <Tab.Navigator
            initialRouteName="ACCEPTED"
            screenOptions={() => ({
              tabBarActiveTintColor: color.primary,
              tabBarInactiveTintColor: color.secondary,
            })}
          >
            <Tab.Screen name="PENDING" component={IncomesTab} initialParams={{currentTab: 'PENDING'}}/>
            <Tab.Screen name="ACCEPTED" component={IncomesTab} initialParams={{currentTab: 'ACCEPTED'}} />
            <Tab.Screen name="REJECTED" component={IncomesTab} initialParams={{currentTab: 'REJECTED'}}/>
          </Tab.Navigator>
        </NavigationContainer>
        <FAB
          style={styles.buttonAddExpense}
          icon={{ name: "add", color: color.palette.white }}
          onPress={handleClickAddCheck}
          color={color.primary}
          size={"large"}
        ></FAB>
      </Screen>
    )
  },
)
