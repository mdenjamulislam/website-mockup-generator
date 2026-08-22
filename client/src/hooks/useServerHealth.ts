import { useState, useCallback, useEffect } from "react";
import { checkHealth } from "../services/mockupService";

export function useServerHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    const healthy = await checkHealth();
    setIsHealthy(healthy);
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [check]);

  return { isHealthy };
}
