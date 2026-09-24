import { SafeAreaView } from '@/components/custom-native-components';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth, useSignUp } from '@clerk/expo';
import { Link, Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldErrors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'password'
    | 'confirmPassword'
    | 'form'
    | 'code',
    string
  >
>;

const validateRegister = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}: FormState) => {
  const nextErrors: FieldErrors = {};

  if (!firstName.trim()) nextErrors.firstName = 'First name is required.';
  if (!lastName.trim()) nextErrors.lastName = 'Last name is required.';

  if (!email.trim()) {
    nextErrors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    nextErrors.email = 'Enter a valid email address.';
  }

  if (!password) {
    nextErrors.password = 'Password is required.';
  } else if (password.length < 8) {
    nextErrors.password = 'Use at least 8 characters.';
  }

  if (!confirmPassword) {
    nextErrors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    nextErrors.confirmPassword = 'Passwords do not match.';
  }

  return nextErrors;
};

const getClerkErrorMessage = (error: any, fallback: string) =>
  error?.errors?.[0]?.longMessage ||
  error?.errors?.[0]?.message ||
  error?.message ||
  fallback;

const Register = () => {
  const { signUp } = useSignUp();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isReady = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.password.length >= 8 &&
      form.confirmPassword.length >= 8 &&
      form.password === form.confirmPassword
    );
  }, [form]);

  if (!isAuthLoaded) {
    return (
      <SafeAreaView className="auth-safe-area">
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleCreateAccount = async () => {
    if (!signUp) return;

    const nextErrors = validateRegister(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signUp.password({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: form.email.trim(),
        password: form.password,
      });

      if (result.error) {
        throw result.error;
      }

      const verificationResult = await signUp.verifications.sendEmailCode();
      if (verificationResult.error) {
        throw verificationResult.error;
      }
      setIsVerifying(true);
      setErrors({});
    } catch (error: any) {
      setErrors({
        form: getClerkErrorMessage(
          error,
          'We could not create your account. Please try again.',
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp || !code.trim()) {
      setErrors((current) => ({
        ...current,
        code: 'Verification code is required.',
      }));
      return;
    }

    try {
      setIsSubmitting(true);
      const verification = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (verification.error) {
        throw verification.error;
      }

      if (signUp.status === 'complete' && signUp.createdSessionId) {
        const finalizeResult = await signUp.finalize();
        if (finalizeResult.error) {
          throw finalizeResult.error;
        }
        router.replace('/(tabs)');
        return;
      }

      setErrors({
        form: 'Your verification could not be completed. Please try again.',
      });
    } catch (error: any) {
      setErrors({
        form: getClerkErrorMessage(error, 'The code entered is invalid.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    try {
      const resendResult = await signUp.verifications.sendEmailCode();
      if (resendResult.error) {
        throw resendResult.error;
      }
      setErrors({ form: 'A new verification code has been sent.' });
    } catch (error: any) {
      setErrors({
        form: getClerkErrorMessage(
          error,
          'Unable to resend the verification code.',
        ),
      });
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">
                    subscription clarity
                  </Text>
                </View>
              </View>
            </View>

            <Text className="auth-title text-center">
              {isVerifying ? 'Check your inbox' : 'Create your account'}
            </Text>
            <Text className="auth-subtitle">
              {isVerifying
                ? 'We sent a 6-digit code to your email so you can finish setup.'
                : 'Track every renewal in one place and keep your budget on autopilot.'}
            </Text>

            <Card className="auth-card">
              {!isVerifying ? (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">First name</Text>
                    <TextInput
                      className={`auth-input ${errors.firstName ? 'auth-input-error' : ''}`}
                      value={form.firstName}
                      autoCapitalize="words"
                      placeholder="Alex"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setForm((current) => ({
                          ...current,
                          firstName: value,
                        }));
                        if (errors.firstName) {
                          setErrors((current) => ({
                            ...current,
                            firstName: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.firstName ? (
                      <Text className="auth-error">{errors.firstName}</Text>
                    ) : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Last name</Text>
                    <TextInput
                      className={`auth-input ${errors.lastName ? 'auth-input-error' : ''}`}
                      value={form.lastName}
                      autoCapitalize="words"
                      placeholder="Morgan"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setForm((current) => ({ ...current, lastName: value }));
                        if (errors.lastName) {
                          setErrors((current) => ({
                            ...current,
                            lastName: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.lastName ? (
                      <Text className="auth-error">{errors.lastName}</Text>
                    ) : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                      value={form.email}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      placeholder="name@example.com"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setForm((current) => ({ ...current, email: value }));
                        if (errors.email) {
                          setErrors((current) => ({
                            ...current,
                            email: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.email ? (
                      <Text className="auth-error">{errors.email}</Text>
                    ) : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                      value={form.password}
                      secureTextEntry
                      placeholder="Create a secure password"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setForm((current) => ({ ...current, password: value }));
                        if (errors.password) {
                          setErrors((current) => ({
                            ...current,
                            password: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.password ? (
                      <Text className="auth-error">{errors.password}</Text>
                    ) : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Confirm password</Text>
                    <TextInput
                      className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                      value={form.confirmPassword}
                      secureTextEntry
                      placeholder="Re-enter your password"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setForm((current) => ({
                          ...current,
                          confirmPassword: value,
                        }));
                        if (errors.confirmPassword) {
                          setErrors((current) => ({
                            ...current,
                            confirmPassword: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.confirmPassword ? (
                      <Text className="auth-error">
                        {errors.confirmPassword}
                      </Text>
                    ) : null}
                  </View>

                  {errors.form ? (
                    <Text className="auth-error">{errors.form}</Text>
                  ) : null}

                  <Button
                    className={`auth-button ${isSubmitting || !isReady ? 'auth-button-disabled' : ''}`}
                    disabled={isSubmitting || !isReady}
                    onPress={handleCreateAccount}
                  >
                    {isSubmitting ? (
                      <ButtonSpinner color="#081126" />
                    ) : (
                      <ButtonText className="auth-button-text">
                        Create account
                      </ButtonText>
                    )}
                  </Button>
                </View>
              ) : (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={`auth-input ${errors.code ? 'auth-input-error' : ''}`}
                      value={code}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      placeholder="123456"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setCode(value);
                        if (errors.code) {
                          setErrors((current) => ({
                            ...current,
                            code: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.code ? (
                      <Text className="auth-error">{errors.code}</Text>
                    ) : null}
                  </View>

                  {errors.form ? (
                    <Text className="auth-error">{errors.form}</Text>
                  ) : null}

                  <Button
                    className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`}
                    disabled={isSubmitting}
                    onPress={handleVerify}
                  >
                    {isSubmitting ? (
                      <ButtonSpinner color="#081126" />
                    ) : (
                      <ButtonText className="auth-button-text">
                        Verify email
                      </ButtonText>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="auth-secondary-button"
                    onPress={handleResendCode}
                  >
                    <ButtonText className="auth-secondary-button-text">
                      Resend code
                    </ButtonText>
                  </Button>
                </View>
              )}
            </Card>

            {!isVerifying ? (
              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/login" asChild>
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>
            ) : (
              <View className="auth-link-row">
                <Text className="auth-link-copy">Wrong email?</Text>
                <Text
                  className="auth-link"
                  onPress={() => setIsVerifying(false)}
                >
                  Edit details
                </Text>
              </View>
            )}

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
