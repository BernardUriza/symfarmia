/**
 * Form management hook with validation and TypeScript support
 * Provides comprehensive form state management and validation
 */

import { useState, useCallback, useEffect } from 'react';
import { UseFormResult } from '@/types';
import { validate } from '@/utils/validation';

interface ValidationRule<T> {
  validator: (value: T) => boolean;
  message: string;
}

interface FieldValidation<T> {
  [key: string]: ValidationRule<T>[];
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: FieldValidation<unknown>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const {
    initialValues,
    validationRules = {},
    validateOnChange = false,
    validateOnBlur = true,
    onSubmit,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T, value: unknown): string => {
    const rules = validationRules[field as string];
    if (!rules || rules.length === 0) return '';

    const result = validate(value, rules);
    return result.errors[0] || '';
  }, [validationRules]);

  const validateAllFields = useCallback((): Record<keyof T, string> => {
    const newErrors = {} as Record<keyof T, string>;

    Object.keys(values).forEach(field => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    });

    return newErrors;
  }, [values, validateField]);

  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));

    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    } else if (touched[field]) {
      // Clear error if field was previously touched and had an error
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateField, validateOnChange, touched]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (validateOnBlur) {
      const error = validateField(field, values[field]);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateField, validateOnBlur, values]);

  const handleSubmit = useCallback((submitHandler?: (values: T) => void | Promise<void>) => {
    return async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      setTouched(allTouched);

      // Validate all fields
      const allErrors = validateAllFields();
      setErrors(allErrors);

      const hasErrors = Object.values(allErrors).some(error => error !== '');
      if (hasErrors) {
        return;
      }

      setIsSubmitting(true);

      try {
        const handler = submitHandler || onSubmit;
        if (handler) {
          await handler(values);
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateAllFields, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const isValid = Object.values(errors).every(error => !error);

  // Reset form when initial values change
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
  };
}

/**
 * Hook for managing form arrays (dynamic lists)
 */
export function useFormArray<T>(
  initialValues: T[] = []
): {
  items: T[];
  append: (item: T) => void;
  prepend: (item: T) => void;
  insert: (index: number, item: T) => void;
  remove: (index: number) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  replace: (index: number, item: T) => void;
  clear: () => void;
  reset: () => void;
} {
  const [items, setItems] = useState<T[]>(initialValues);

  const append = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const prepend = useCallback((item: T) => {
    setItems(prev => [item, ...prev]);
  }, []);

  const insert = useCallback((index: number, item: T) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 0, item);
      return newItems;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const swap = useCallback((indexA: number, indexB: number) => {
    setItems(prev => {
      const newItems = [...prev];
      [newItems[indexA], newItems[indexB]] = [newItems[indexB], newItems[indexA]];
      return newItems;
    });
  }, []);

  const move = useCallback((from: number, to: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const item = newItems.splice(from, 1)[0];
      newItems.splice(to, 0, item);
      return newItems;
    });
  }, []);

  const replace = useCallback((index: number, item: T) => {
    setItems(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const reset = useCallback(() => {
    setItems(initialValues);
  }, [initialValues]);

  return {
    items,
    append,
    prepend,
    insert,
    remove,
    swap,
    move,
    replace,
    clear,
    reset,
  };
}

/**
 * Hook for form field with individual validation
 */
export function useFormField<T>(
  initialValue: T,
  validationRules: ValidationRule<T>[] = []
): {
  value: T;
  error: string;
  isTouched: boolean;
  isValid: boolean;
  setValue: (value: T) => void;
  setError: (error: string) => void;
  validate: () => string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: () => void;
  reset: () => void;
} {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string>('');
  const [isTouched, setIsTouched] = useState<boolean>(false);

  const validateValue = useCallback((val: T): string => {
    if (validationRules.length === 0) return '';

    const result = validate(val, validationRules);
    return result.errors[0] || '';
  }, [validationRules]);

  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const newValue = event.target.value as unknown as T;
    setValue(newValue);

    if (isTouched) {
      const newError = validateValue(newValue);
      setError(newError);
    }
  }, [validateValue, isTouched]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    const newError = validateValue(value);
    setError(newError);
  }, [validateValue, value]);

  const validateField = useCallback((): string => {
    const newError = validateValue(value);
    setError(newError);
    setIsTouched(true);
    return newError;
  }, [validateValue, value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setIsTouched(false);
  }, [initialValue]);

  const isValid = !error;

  return {
    value,
    error,
    isTouched,
    isValid,
    setValue,
    setError,
    validate: validateField,
    handleChange,
    handleBlur,
    reset,
  };
}