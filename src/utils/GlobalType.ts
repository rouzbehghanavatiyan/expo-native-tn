export interface AppState {
  main?: {
    userLogin?: any;
    messageModal?: {
      show: boolean;
      title: string;
      icon: string;
    };
  };
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
  passwordConfirmation?: string;
}

export interface FormValues {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}
