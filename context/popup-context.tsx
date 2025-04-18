"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type PopupContextType = {
  isJsonFormatterOpen: boolean;
  openJsonFormatter: () => void;
  closeJsonFormatter: () => void;
  isJsonDiffOpen: boolean;
  openJsonDiff: () => void;
  closeJsonDiff: () => void;
  isTextDiffOpen: boolean;
  openTextDiff: () => void;
  closeTextDiff: () => void;
  headerHeight: string;
};

const defaultContextValue: PopupContextType = {
  isJsonFormatterOpen: false,
  openJsonFormatter: () => {},
  closeJsonFormatter: () => {},
  isJsonDiffOpen: false,
  openJsonDiff: () => {},
  closeJsonDiff: () => {},
  isTextDiffOpen: false,
  openTextDiff: () => {},
  closeTextDiff: () => {},
  headerHeight: "4rem", // 64px - matches the h-16 of the header
};

const PopupContext = createContext<PopupContextType>(defaultContextValue);

export function usePopupContext() {
  return useContext(PopupContext);
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [isJsonFormatterOpen, setIsJsonFormatterOpen] = useState(false);
  const [isJsonDiffOpen, setIsJsonDiffOpen] = useState(false);
  const [isTextDiffOpen, setIsTextDiffOpen] = useState(false);

  const openJsonFormatter = () => {
    setIsJsonFormatterOpen(true);
    setIsJsonDiffOpen(false);
    setIsTextDiffOpen(false);
    // Prevent scrolling when popup is open
    document.body.style.overflow = "hidden";
  };

  const closeJsonFormatter = () => {
    setIsJsonFormatterOpen(false);
    // Re-enable scrolling when popup is closed
    document.body.style.overflow = "";
  };

  const openJsonDiff = () => {
    setIsJsonDiffOpen(true);
    setIsJsonFormatterOpen(false);
    setIsTextDiffOpen(false);
    // Prevent scrolling when popup is open
    document.body.style.overflow = "hidden";
  };

  const closeJsonDiff = () => {
    setIsJsonDiffOpen(false);
    // Re-enable scrolling when popup is closed
    document.body.style.overflow = "";
  };

  const openTextDiff = () => {
    setIsTextDiffOpen(true);
    setIsJsonFormatterOpen(false);
    setIsJsonDiffOpen(false);
    // Prevent scrolling when popup is open
    document.body.style.overflow = "hidden";
  };

  const closeTextDiff = () => {
    setIsTextDiffOpen(false);
    // Re-enable scrolling when popup is closed
    document.body.style.overflow = "";
  };

  return (
    <PopupContext.Provider
      value={{
        isJsonFormatterOpen,
        openJsonFormatter,
        closeJsonFormatter,
        isJsonDiffOpen,
        openJsonDiff,
        closeJsonDiff,
        isTextDiffOpen,
        openTextDiff,
        closeTextDiff,
        headerHeight: "4rem",
      }}
    >
      {children}
    </PopupContext.Provider>
  );
}
