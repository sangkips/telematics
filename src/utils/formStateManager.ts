/**
 * Form State Manager - Handles form state preservation during error recovery
 * Requirement 7.4: Implement form state preservation during error recovery
 */

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  submitAttempts: number;
  lastSaved?: Date;
  originalData: T;
}

export interface FormStateManagerOptions {
  persistKey?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  maxSubmitAttempts?: number;
}

export class FormStateManager<T extends Record<string, unknown>> {
  private state: FormState<T>;
  private listeners: Set<(state: FormState<T>) => void> = new Set();
  private autoSaveTimer: number | null = null;
  private options: Required<FormStateManagerOptions>;

  constructor(
    initialData: T,
    options: FormStateManagerOptions = {}
  ) {
    this.options = {
      persistKey: '',
      autoSave: false,
      autoSaveDelay: 1000,
      maxSubmitAttempts: 3,
      ...options,
    };

    // Try to restore from localStorage if persistKey is provided
    const restoredState = this.options.persistKey 
      ? this.restoreFromStorage() 
      : null;

    this.state = restoredState || {
      data: { ...initialData },
      errors: {},
      touched: {},
      isDirty: false,
      isSubmitting: false,
      submitAttempts: 0,
      originalData: { ...initialData },
    };
  }

  /**
   * Get current form state
   */
  getState(): FormState<T> {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: FormState<T>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update form field value
   */
  updateField(field: keyof T, value: T[keyof T]): void {
    const newData = { ...this.state.data, [field]: value };
    const isDirty = this.checkIfDirty(newData);

    this.setState({
      data: newData,
      touched: { ...this.state.touched, [field]: true },
      isDirty,
    });

    // Clear field error when user starts typing
    if (this.state.errors[field as string]) {
      this.clearFieldError(field as string);
    }

    // Auto-save if enabled
    if (this.options.autoSave) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Update multiple fields at once
   */
  updateFields(updates: Partial<T>): void {
    const newData = { ...this.state.data, ...updates };
    const isDirty = this.checkIfDirty(newData);
    const newTouched = { ...this.state.touched };

    // Mark all updated fields as touched
    Object.keys(updates).forEach(key => {
      newTouched[key] = true;
    });

    this.setState({
      data: newData,
      touched: newTouched,
      isDirty,
    });

    if (this.options.autoSave) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Set field error
   */
  setFieldError(field: string, error: string): void {
    this.setState({
      errors: { ...this.state.errors, [field]: error },
    });
  }

  /**
   * Set multiple field errors
   */
  setFieldErrors(errors: Record<string, string>): void {
    this.setState({
      errors: { ...this.state.errors, ...errors },
    });
  }

  /**
   * Clear field error
   */
  clearFieldError(field: string): void {
    const newErrors = { ...this.state.errors };
    delete newErrors[field];
    this.setState({ errors: newErrors });
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.setState({ errors: {} });
  }

  /**
   * Mark field as touched
   */
  touchField(field: string): void {
    this.setState({
      touched: { ...this.state.touched, [field]: true },
    });
  }

  /**
   * Mark all fields as touched
   */
  touchAllFields(): void {
    const touched: Record<string, boolean> = {};
    Object.keys(this.state.data).forEach(key => {
      touched[key] = true;
    });
    this.setState({ touched });
  }

  /**
   * Set submitting state
   */
  setSubmitting(isSubmitting: boolean): void {
    this.setState({ isSubmitting });
  }

  /**
   * Increment submit attempts
   */
  incrementSubmitAttempts(): void {
    this.setState({
      submitAttempts: this.state.submitAttempts + 1,
    });
  }

  /**
   * Reset submit attempts
   */
  resetSubmitAttempts(): void {
    this.setState({ submitAttempts: 0 });
  }

  /**
   * Check if max submit attempts reached
   */
  isMaxSubmitAttemptsReached(): boolean {
    return this.state.submitAttempts >= this.options.maxSubmitAttempts;
  }

  /**
   * Reset form to original state
   */
  reset(): void {
    this.setState({
      data: { ...this.state.originalData },
      errors: {},
      touched: {},
      isDirty: false,
      isSubmitting: false,
      submitAttempts: 0,
    });

    this.clearStorage();
  }

  /**
   * Reset form with new data
   */
  resetWithData(newData: T): void {
    this.setState({
      data: { ...newData },
      originalData: { ...newData },
      errors: {},
      touched: {},
      isDirty: false,
      isSubmitting: false,
      submitAttempts: 0,
    });

    this.clearStorage();
  }

  /**
   * Save current state (useful after successful submission)
   */
  save(): void {
    this.setState({
      originalData: { ...this.state.data },
      isDirty: false,
      lastSaved: new Date(),
      submitAttempts: 0,
    });

    this.clearStorage();
  }

  /**
   * Get validation summary
   */
  getValidationSummary(): {
    hasErrors: boolean;
    errorCount: number;
    touchedErrorCount: number;
    errors: Record<string, string>;
  } {
    const errors = this.state.errors;
    const touched = this.state.touched;
    const errorCount = Object.keys(errors).length;
    const touchedErrorCount = Object.keys(errors).filter(
      field => touched[field]
    ).length;

    return {
      hasErrors: errorCount > 0,
      errorCount,
      touchedErrorCount,
      errors,
    };
  }

  /**
   * Get form summary for debugging
   */
  getFormSummary(): {
    isDirty: boolean;
    hasErrors: boolean;
    isSubmitting: boolean;
    submitAttempts: number;
    touchedFields: string[];
    changedFields: string[];
  } {
    const touchedFields = Object.keys(this.state.touched).filter(
      field => this.state.touched[field]
    );
    
    const changedFields = Object.keys(this.state.data).filter(
      field => this.state.data[field] !== this.state.originalData[field]
    );

    return {
      isDirty: this.state.isDirty,
      hasErrors: Object.keys(this.state.errors).length > 0,
      isSubmitting: this.state.isSubmitting,
      submitAttempts: this.state.submitAttempts,
      touchedFields,
      changedFields,
    };
  }

  private setState(updates: Partial<FormState<T>>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
    
    // Persist to storage if enabled
    if (this.options.persistKey) {
      this.persistToStorage();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in form state listener:', error);
      }
    });
  }

  private checkIfDirty(data: T): boolean {
    return Object.keys(data).some(
      key => data[key] !== this.state.originalData[key]
    );
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.persistToStorage();
      this.autoSaveTimer = null;
    }, this.options.autoSaveDelay);
  }

  private persistToStorage(): void {
    if (!this.options.persistKey) return;

    try {
      const serializedState = JSON.stringify({
        ...this.state,
        lastSaved: new Date().toISOString(),
      });
      localStorage.setItem(this.options.persistKey, serializedState);
    } catch (error) {
      console.warn('Failed to persist form state:', error);
    }
  }

  private restoreFromStorage(): FormState<T> | null {
    if (!this.options.persistKey) return null;

    try {
      const serializedState = localStorage.getItem(this.options.persistKey);
      if (!serializedState) return null;

      const restoredState = JSON.parse(serializedState);
      
      // Convert lastSaved back to Date if it exists
      if (restoredState.lastSaved) {
        restoredState.lastSaved = new Date(restoredState.lastSaved);
      }

      return restoredState;
    } catch (error) {
      console.warn('Failed to restore form state:', error);
      this.clearStorage();
      return null;
    }
  }

  private clearStorage(): void {
    if (!this.options.persistKey) return;

    try {
      localStorage.removeItem(this.options.persistKey);
    } catch (error) {
      console.warn('Failed to clear form state storage:', error);
    }
  }

  /**
   * Cleanup method to call when component unmounts
   */
  destroy(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    this.listeners.clear();
  }
}