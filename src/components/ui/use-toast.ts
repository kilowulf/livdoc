// Inspired by react-hot-toast library
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Constants to control the behavior of toasts
const TOAST_LIMIT = 1; // Maximum number of toasts to display at one time
const TOAST_REMOVE_DELAY = 1000000; // Delay (in ms) before a toast is automatically removed

/**
 * ToasterToast:
 * - Defines the shape of a toast object, extending ToastProps with additional optional fields like title, description, and action.
 */
type ToasterToast = ToastProps & {
  id: string; // Unique identifier for each toast
  title?: React.ReactNode; // Optional title of the toast
  description?: React.ReactNode; // Optional description text
  action?: ToastActionElement; // Optional action element (e.g., button) associated with the toast
};

/**
 * actionTypes:
 * - Defines the different types of actions that can be performed on a toast.
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // Action to add a new toast
  UPDATE_TOAST: "UPDATE_TOAST", // Action to update an existing toast
  DISMISS_TOAST: "DISMISS_TOAST", // Action to dismiss (hide) a toast
  REMOVE_TOAST: "REMOVE_TOAST" // Action to remove a toast from memory
} as const;

let count = 0; // Counter for generating unique IDs for toasts

/**
 * genId:
 * - Generates a unique ID for each toast by incrementing the `count` variable.
 */
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString(); // Return the ID as a string
}

/**
 * Action:
 * - Defines the possible actions that can be dispatched to modify the toast state.
 * - Each action has a type and, optionally, a payload (e.g., the toast to add or update).
 */
type Action =
  | {
      type: (typeof actionTypes)["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: (typeof actionTypes)["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: (typeof actionTypes)["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: (typeof actionTypes)["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

/**
 * State:
 * - The structure of the toast state, which holds an array of `ToasterToast` objects.
 */
interface State {
  toasts: ToasterToast[]; // List of active toasts
}

/**
 * toastTimeouts:
 * - A Map to track timeout IDs for each toast, allowing delayed removal.
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * addToRemoveQueue:
 * - Adds a toast to a queue for removal after a delay (`TOAST_REMOVE_DELAY`).
 * - If the toast is already in the queue, the function does nothing.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * reducer:
 * - Reducer function to manage the toast state.
 * - Handles adding, updating, dismissing, and removing toasts based on the action type.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Adds the toast to the removal queue
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Marks the toast as closed
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false
              }
            : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};

/**
 * listeners:
 * - A list of functions to be called when the toast state changes.
 */
const listeners: Array<(state: State) => void> = [];

/**
 * memoryState:
 * - The current state of toasts, managed in memory.
 */
let memoryState: State = { toasts: [] };

/**
 * dispatch:
 * - Dispatches actions to modify the toast state by calling the reducer and notifying all listeners.
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * toast:
 * - Creates a new toast, dispatches it to the state, and returns control functions (update, dismiss).
 */
type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id }
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });

  return {
    id: id,
    dismiss,
    update
  };
}

/**
 * useToast:
 * - Custom React hook to manage toast notifications.
 * - Allows components to create, dismiss, and track toast notifications.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}

export { useToast, toast };
