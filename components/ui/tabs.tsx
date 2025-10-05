import * as React from "react";
import { cn } from "../../lib/utils";

type TabsProps = {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
};

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
}

export function Tabs({ defaultValue, className, children, onValueChange }: TabsProps) {
  const [value, setValue] = React.useState<string>(defaultValue);
  
  const handleValueChange = React.useCallback((newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabsListProps = {
  className?: string;
  children: React.ReactNode;
};

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={cn("flex border-b", className)}>
      {children}
    </div>
  );
}

type TabTriggerProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export function TabTrigger({ value, className, children, disabled = false }: TabTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        isSelected 
          ? "border-b-2 border-blue-500 text-blue-600" 
          : "text-gray-500 hover:text-gray-700 hover:border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
};

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;
  
  if (!isSelected) return null;
  
  return (
    <div 
      role="tabpanel"
      className={cn("pt-4", className)}
    >
      {children}
    </div>
  );
}