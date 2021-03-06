import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import React, { FC, useLayoutEffect, useState } from "react"
import { Controller, FieldError, useForm } from "react-hook-form"
import { StyleSheet, View } from "react-native"
import { Button, MessageOverlay, Screen, Text, TextField } from "../../components"
import { useStores } from "../../models"
import { NavigatorParamList } from "../../navigators/stacks"
import { color, spacing } from "../../theme"
import { userState } from "../../recoil"
import { useRecoilState } from "recoil"

const secureLogin = require("../../../assets/images/secureLogin.png")

const styles = StyleSheet.create({
  button: {
    height: 48,
    marginTop: spacing[6],
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  input: {
    borderColor: color.secondary,
    borderRadius: 100,
    borderWidth: 2,
    height: 24,
    padding: 10,
  },
  logoBackground: {
    alignItems: "center",
    backgroundColor: color.primary,
    height: 120,
    justifyContent: "flex-end",
    // marginVertical: spacing[5],
    width: "100%",
  },
  logoText: {
    color: color.palette.white,
    fontSize: 24,
    marginBottom: spacing[3],
  },
  root: {
    alignItems: "center",
    flex: 1,
  },
  secondaryPath: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing[6],
  },
  view: {
    flexDirection: "column",
    width: "80%",
  },
})

type FormData = {
  email: string
  password: string
}

export const LoginScreen: FC<StackScreenProps<NavigatorParamList, "login">> = observer(
  function LoginScreen({ navigation }) {
    const registerScreen = () => navigation.navigate("register")
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>()
    const [user, setUser] = useRecoilState(userState)
    const { authenticationStore } = useStores()
    const [isModalErrorVisible, setIsModalErrorVisible] = useState(false)

    const hasRequestError = () => setIsModalErrorVisible(true)
    const handleOutsideModalPress = () => setIsModalErrorVisible(false)

    useLayoutEffect(() => {
      return () => {
        authenticationStore.resetStatus()
      }
    }, [authenticationStore])
    const onLogin = async (data: FormData) => {
      await authenticationStore.login(data.email, data.password, setUser, hasRequestError)
    }

    const onPressForgotPassword = () => {
      alert("ForgotPassword")
    }

    return (
      <Screen style={styles.root} preset="scroll" unsafe>
        <MessageOverlay
          error={"errors.verifyAccountInfo"}
          isVisible={isModalErrorVisible}
          setIsVisible={handleOutsideModalPress}
          backImage={secureLogin}
        />
        <View style={styles.logoBackground}>
          <Text style={styles.logoText}>BNB Bank</Text>
        </View>
        <View style={styles.view}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                inputStyle={styles.input}
                placeholderTx="loginScreen.email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errors={errors}
                name="email"
                autoCapitalize="none"
              />
            )}
            name="email"
            defaultValue=""
          />

          <Controller
            control={control}
            rules={{
              required: true,
              minLength: 4,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                inputStyle={styles.input}
                secureTextEntry={true}
                placeholderTx="loginScreen.password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errors={errors}
                name="password"
              />
            )}
            name="password"
            defaultValue=""
          />

          <Button
            style={styles.button}
            tx={
              authenticationStore.status === "pending"
                ? "loginScreen.loading"
                : "loginScreen.submit"
            }
            onPress={handleSubmit(onLogin)}
          />
          <View style={styles.secondaryPath}>
            <Text
              style={styles.buttonText}
              tx="loginScreen.forgotPassword"
              onPress={onPressForgotPassword}
            />
            <Text style={styles.buttonText} tx="loginScreen.register" onPress={registerScreen} />
          </View>
        </View>
      </Screen>
    )
  },
)
