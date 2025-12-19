const LOGIN_URL =
  "https://tick-it-nq29.onrender.com/api/wallet/login";

export interface LoginResponse {
  token: string;
  address: string;
}

export const loginWithWallet = async (
  address: string
): Promise<LoginResponse> => {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!res.ok) {
    throw new Error("Wallet login failed");
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Login failed");
  }

  return json.data;
};
