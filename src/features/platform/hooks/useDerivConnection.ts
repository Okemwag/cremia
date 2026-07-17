import { useCallback, useState } from "react";
import { useSynexAPI } from "../services/synexApi";

export function useDerivConnection() {
  const api = useSynexAPI();
  const [connecting, setConnecting] = useState(false);

  const connectDeriv = useCallback(async () => {
    setConnecting(true);
    try {
      const { authorize_url: authorizeURL } = await api.connectURL();
      window.location.assign(authorizeURL);
    } catch (error) {
      setConnecting(false);
      throw error;
    }
  }, [api]);

  return { connectDeriv, connecting };
}
