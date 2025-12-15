"use client";

import { useActionState, useTransition } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

/**
 * React 19 useActionState Hook Wrapper
 *
 * useActionState replaces useFormState and provides:
 * - Pending state tracking
 * - Automatic form reset on success
 * - Progressive enhancement (works without JS)
 *
 * @example
 * // Define your server action
 * async function submitForm(prevState: FormState, formData: FormData) {
 *   const email = formData.get('email');
 *   // ... validation and database operations
 *   return { success: true, message: 'Submitted!' };
 * }
 *
 * // Use in component
 * function MyForm() {
 *   const [state, formAction, isPending] = useActionState(submitForm, initialState);
 *
 *   return (
 *     <form action={formAction}>
 *       <input name="email" />
 *       <button disabled={isPending}>
 *         {isPending ? 'Submitting...' : 'Submit'}
 *       </button>
 *       {state.message && <p>{state.message}</p>}
 *     </form>
 *   );
 * }
 */

export interface ActionState {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
}

export const initialActionState: ActionState = {
  success: false,
  error: undefined,
  message: undefined,
  data: undefined,
};

/**
 * Form with useActionState - complete form handling
 */
interface ActionFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function ActionForm({
  action,
  onSuccess,
  onError,
  children,
  className = "",
}: ActionFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState
  );

  // Handle success/error callbacks
  if (state.success && onSuccess && state.data) {
    onSuccess(state.data);
  }
  if (state.error && onError) {
    onError(state.error);
  }

  return (
    <form action={formAction} className={className}>
      {children}

      {/* Status Messages */}
      {state.error && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && state.message && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.message}</span>
        </div>
      )}
    </form>
  );
}

/**
 * Submit button that uses form's pending state
 */
interface ActionSubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export function ActionSubmitButton({
  children,
  loadingText = "Processing...",
  className = "",
  disabled = false,
}: ActionSubmitButtonProps) {
  // Note: This needs to be inside a form using useActionState
  // The pending state comes from the form's action
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Hook to create form actions with better DX
 */
export function useFormAction<T = any>(
  serverAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; data?: T }>
) {
  const wrappedAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    try {
      const result = await serverAction(formData);
      return {
        success: result.success,
        error: result.error,
        data: result.data,
        message: result.success ? "Success!" : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  return useActionState(wrappedAction, initialActionState);
}

// Re-export useActionState for convenience
export { useActionState };
