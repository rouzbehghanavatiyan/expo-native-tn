import { FormErrors } from "./GlobalType";

export const validateForm = (inputs: any, setErrors: any): boolean => {
  const newErrors: FormErrors = {};
  let isValid = true;
  if (!inputs.username?.trim()) {
    newErrors.username = "Username is required";
    isValid = false;
  }

  if (!inputs.email?.trim()) {
    newErrors.email = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
    newErrors.email = "Please enter a valid email address";
    isValid = false;
  }

  if (!inputs.password) {
    newErrors.password = "Password is required";
    isValid = false;
  } else if (inputs.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
    isValid = false;
  }

  if (!inputs.passwordConfirmation) {
    newErrors.passwordConfirmation = "Password confirmation is required";
    isValid = false;
  } else if (inputs.passwordConfirmation !== inputs.password) {
    newErrors.passwordConfirmation = "Passwords do not match";
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

export const validateFormLogin = (formState: any, setErrors: any) => {
  const newErrors: FormErrors = {
    general: "",
    username: "",
    password: "",
  };

  if (!formState.username.trim()) {
    newErrors.username = "Username is required";
  }

  if (!formState.password.trim()) {
    newErrors.password = "Password is required";
  } else if (formState.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  setErrors(newErrors);

  return !newErrors.username && !newErrors.password;
};
