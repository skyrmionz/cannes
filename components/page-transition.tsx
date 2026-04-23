"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

const TransitionContext = createContext<{
  navigateTo: (href: string) => void;
}>({
  navigateTo: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const navigateTo = useCallback(
    (href: string) => {
      setIsLeaving(true);
      setTimeout(() => {
        router.push(href);
      }, 500);
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="page-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLeaving ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex min-h-screen flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
