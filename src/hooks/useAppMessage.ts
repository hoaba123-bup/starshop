import { useAppMessageContext } from "../components/ui/AppMessageProvider";

export function useAppMessage() {
  return useAppMessageContext();
}
