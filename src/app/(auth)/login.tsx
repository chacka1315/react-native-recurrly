import { SafeAreaView } from '@/components/custom-native-components';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { posthog } from '@/lib/posthog';
import { useAuth, useSignIn } from '@clerk/expo';
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
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<'email' | 'password' | 'form', string>>;

const validateLogin = ({ email, password }: FormState) => {
  const nextErrors: FieldErrors = {};

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

  return nextErrors;
};

const getClerkErrorMessage = (error: any, fallback: string) =>
  error?.errors?.[0]?.longMessage ||
  error?.errors?.[0]?.message ||
  error?.message ||
  fallback;

const Login = () => {
  const { signIn } = useSignIn();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isValidBranding = useMemo(() => {
    return Boolean(form.email.trim() && form.password.length >= 8);
  }, [form.email, form.password]);

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

  const handleSubmit = async () => {
    if (!signIn) return;

    const nextErrors = validateLogin(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signIn.password({
        identifier: form.email.trim(),
        password: form.password,
      });

      if (result.error) {
        throw result.error;
      }

      if (signIn.status === 'complete') {
        const finalizeResult = await signIn.finalize();
        if (finalizeResult.error) {
          throw finalizeResult.error;
        }
        posthog?.capture('user_signed_in', {
          auth_method: 'email_password',
          verification_required: false,
        });
        posthog?.logger.info('authentication completed', {
          flow: 'sign_in',
          verification_required: false,
        });
        router.replace('/(tabs)');
        return;
      }

      if (
        signIn.status === 'needs_client_trust' ||
        signIn.status === 'needs_second_factor'
      ) {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code',
        );

        if (!emailCodeFactor) {
          setErrors({
            form: 'This account requires a verification method that is not available in this screen.',
          });
          return;
        }

        const codeResult = await signIn.mfa.sendEmailCode();
        if (codeResult.error) {
          throw codeResult.error;
        }
        posthog?.capture('sign_in_verification_requested', {
          verification_method: 'email_code',
        });
        setIsVerifying(true);
        setErrors({});
        return;
      }

      setErrors({ form: 'Your sign-in could not be completed.' });
    } catch (error: any) {
      posthog?.captureException(error, { auth_flow: 'sign_in' });
      setErrors({
        form: getClerkErrorMessage(
          error,
          'We could not sign you in. Please try again.',
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signIn || !code.trim()) {
      setErrors({ form: 'Verification code is required.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (result.error) {
        throw result.error;
      }

      if (signIn.status === 'complete') {
        const finalizeResult = await signIn.finalize();
        if (finalizeResult.error) {
          throw finalizeResult.error;
        }
        posthog?.capture('user_signed_in', {
          auth_method: 'email_password',
          verification_required: true,
        });
        posthog?.logger.info('authentication completed', {
          flow: 'sign_in',
          verification_required: true,
        });
        router.replace('/(tabs)');
        return;
      }

      setErrors({ form: 'The verification is not complete yet.' });
    } catch (error: any) {
      posthog?.captureException(error, { auth_flow: 'sign_in_verification' });
      setErrors({
        form: getClerkErrorMessage(error, 'The verification code is invalid.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn) return;

    try {
      setIsSubmitting(true);
      const result = await signIn.mfa.sendEmailCode();
      if (result.error) {
        throw result.error;
      }
      posthog?.capture('sign_in_verification_resent', {
        verification_method: 'email_code',
      });
      setErrors({});
    } catch (error: any) {
      posthog?.captureException(error, {
        auth_flow: 'sign_in_verification_resend',
      });
      setErrors({
        form: getClerkErrorMessage(error, 'Unable to resend the code.'),
      });
    } finally {
      setIsSubmitting(false);
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
              {isVerifying ? 'Verify your sign-in' : 'Welcome back'}
            </Text>
            <Text className="auth-subtitle">
              {isVerifying
                ? 'Enter the verification code sent to your email.'
                : 'Keep an eye on renewals, stay on budget, and never miss a payment.'}
            </Text>

            <Card className="auth-card">
              <View className="auth-form">
                {!isVerifying ? (
                  <>
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
                        placeholder="Enter your password"
                        placeholderTextColor="#8b8b8b"
                        onChangeText={(value) => {
                          setForm((current) => ({
                            ...current,
                            password: value,
                          }));
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
                  </>
                ) : (
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      autoCapitalize="none"
                      keyboardType="number-pad"
                      placeholder="123456"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={(value) => {
                        setCode(value);
                        setErrors((current) => ({
                          ...current,
                          form: undefined,
                        }));
                      }}
                    />
                  </View>
                )}

                {errors.form ? (
                  <Text className="auth-error">{errors.form}</Text>
                ) : null}

                <Button
                  className={`auth-button ${isSubmitting || (!isVerifying && !isValidBranding) || (isVerifying && !code.trim()) ? 'auth-button-disabled' : ''}`}
                  disabled={
                    isSubmitting ||
                    (!isVerifying && !isValidBranding) ||
                    (isVerifying && !code.trim())
                  }
                  onPress={isVerifying ? handleVerify : handleSubmit}
                >
                  {isSubmitting ? (
                    <ButtonSpinner color="#081126" />
                  ) : (
                    <ButtonText className="auth-button-text">
                      {isVerifying ? 'Verify code' : 'Sign in'}
                    </ButtonText>
                  )}
                </Button>

                {isVerifying ? (
                  <Button
                    variant="link"
                    disabled={isSubmitting}
                    onPress={handleResendCode}
                  >
                    <ButtonText className="auth-secondary-button-text">
                      Resend code
                    </ButtonText>
                  </Button>
                ) : null}
              </View>
            </Card>

            <View className="auth-divider-row">
              <View className="auth-divider-line" />
              <Text className="auth-divider-text">or</Text>
              <View className="auth-divider-line" />
            </View>

            <Button
              variant="outline"
              className="auth-secondary-button"
              onPress={() => router.push('/(auth)/register')}
            >
              <ButtonText className="auth-secondary-button-text">
                Create account
              </ButtonText>
            </Button>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Need a fresh start?</Text>
              <Link href="/(auth)/register" asChild>
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
