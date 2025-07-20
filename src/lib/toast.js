import toast from "react-hot-toast";

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 */
export const showSuccess = (message) => {
  toast.success(message);
};

/**
 * Show an error toast notification
 * @param {string} message - The message to display
 */
export const showError = (message) => {
  toast.error(message);
};

/**
 * Show an info toast notification
 * @param {string} message - The message to display
 */
export const showInfo = (message) => {
  toast(message);
};

/**
 * Show a loading toast notification that can be updated
 * @param {string} loadingMessage - The loading message to display
 * @param {Promise} promise - The promise to wait for
 * @param {Object} messages - Success and error messages
 */
export const showPromiseToast = (loadingMessage, promise, messages) => {
  return toast.promise(promise, {
    loading: loadingMessage,
    success: messages.success,
    error: messages.error,
  });
};
