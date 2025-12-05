import React, { createContext, useContext, useMemo } from "react";
import { message } from "antd";

type NotifyFn = (content: React.ReactNode, config?: Parameters<typeof message.open>[0]) => void;

interface MessageContextValue {
  open: typeof message.open;
  success: NotifyFn;
  error: NotifyFn;
  warning: NotifyFn;
  info: NotifyFn;
}

const AppMessageContext = createContext<MessageContextValue | null>(null);

export function AppMessageProvider({ children }: { children: React.ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage();

  const value = useMemo<MessageContextValue>(
    () => ({
      open: (config) => messageApi.open(config),
      success: (content, config) => messageApi.open({ type: "success", content, ...(config || {}) }),
      error: (content, config) => messageApi.open({ type: "error", content, ...(config || {}) }),
      warning: (content, config) => messageApi.open({ type: "warning", content, ...(config || {}) }),
      info: (content, config) => messageApi.open({ type: "info", content, ...(config || {}) }),
    }),
    [messageApi]
  );

  return (
    <AppMessageContext.Provider value={value}>
      {contextHolder}
      {children}
    </AppMessageContext.Provider>
  );
}

export function useAppMessageContext() {
  const ctx = useContext(AppMessageContext);
  if (!ctx) {
    throw new Error("useAppMessageContext must be used inside AppMessageProvider");
  }
  return ctx;
}
