export type TLoginRequest = {
  username: string;
  password: string;
}

export type TLoginResponse = {
  id: string;
  name: string;
  username: string;
  role: string;
}