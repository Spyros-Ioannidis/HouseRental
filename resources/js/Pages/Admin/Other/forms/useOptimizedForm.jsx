import { useCallback, useMemo, useReducer, useRef } from "react";

import { validateField } from "@/Pages/Admin/Other/forms/Validator";

/* ----------------------------------------
   DEEP + SMART EQUALITY HELPERS
---------------------------------------- */

function isSetEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((v) => setA.has(v));
}

function isEqual(a, b) {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return isSetEqual(a, b);
  }

  if (a && b && typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => isEqual(a[key], b[key]));
  }

  return false;
}

/* ----------------------------------------
   REDUCER
---------------------------------------- */

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value,
        },
      };

    case "RESET_FIELD":
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value,
        },
      };

    case "RESET_ALL":
      return {
        values: action.values,
      };

    default:
      return state;
  }
}

/* ----------------------------------------
   HOOK
---------------------------------------- */

export default function useOptimizedForm(schema, initialValues) {
  const initialRef = useRef(structuredClone(initialValues));

  const [state, dispatch] = useReducer(reducer, {
    values: structuredClone(initialValues),
  });


  const syncWithServer = useCallback((newValues) => {
    initialRef.current = structuredClone(newValues);
    dispatch({
      type: "RESET_ALL",
      values: structuredClone(newValues)
    });
  }, []);

  const handlerCache = useRef({});

  /* ----------------------------------------
     ACTIONS
  ---------------------------------------- */

  const setField = useCallback((field, value) => {
    dispatch({
      type: "SET_FIELD",
      field,
      value,
    });
  }, []);

  const resetField = useCallback((field) => {
    dispatch({
      type: "RESET_FIELD",
      field,
      value: structuredClone(initialRef.current[field]),
    });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({
      type: "RESET_ALL",
      values: structuredClone(initialRef.current),
    });
  }, []);

  /* ----------------------------------------
     VALIDATION
  ---------------------------------------- */

  const errors = useMemo(() => {
    const result = {};

    for (const key in schema) {
      result[key] = validateField(state.values[key], schema[key], state.values);
    }

    return result;
  }, [state.values, schema]);

  const isValid = useMemo(() => {
    return Object.values(errors).every((e) => !e);
  }, [errors]);

  /* ----------------------------------------
     DIRTY FIELDS
  ---------------------------------------- */

  const dirtyFields = useMemo(() => {
    const dirty = {};

    for (const key in state.values) {
      dirty[key] = !isEqual(state.values[key], initialRef.current[key]);
    }

    return dirty;
  }, [state.values]);

  /* ----------------------------------------
     DIRTY PAYLOAD
  ---------------------------------------- */

  const getDirtyPayload = useCallback(() => {
    const payload = {};

    for (const key in state.values) {
      if (!isEqual(state.values[key], initialRef.current[key])) {
        payload[key] = state.values[key];
      }
    }

    return payload;
  }, [state.values]);


  const getFieldProps = useCallback(
    (field) => {
      const value = state.values[field];
      const original = initialRef.current[field];
      const rule = schema[field] || {};

      if (!handlerCache.current[field]) {
        handlerCache.current[field] = {
          onChange: (input) => {
            const raw =
              input?.target !== undefined ? input.target.value : input;

            let next = raw;

            // if (typeof original === "number") {
            //   next = raw === "" ? "" : Number(raw);
            // }

            setField(field, next);
          },

          onReset: () => resetField(field),
        };
      }

      const assignIfExists = (obj, key, nextValue) => {
        if (nextValue != null) obj[key] = nextValue;
      };

      const props = {
        name: field,
        value,
        original,
        error: errors[field],
        isDirty: !isEqual(value, original),
        onChange: handlerCache.current[field].onChange,
        onReset: handlerCache.current[field].onReset,
      };

      assignIfExists(props, "required", rule.required);
      assignIfExists(props, "min", rule.min);
      assignIfExists(props, "max", rule.max);
      assignIfExists(props, "minlength", rule.minlength);
      assignIfExists(props, "maxlength", rule.maxlength);
      assignIfExists(props, "label", rule.label);
      assignIfExists(props, "type", rule.type);

      return props;
    },
    [state.values, errors, setField, resetField, schema],
  );

  /* ----------------------------------------
     RETURN API
  ---------------------------------------- */

  return {
    values: state.values,

    errors,
    isValid,

    dirtyFields,
    getDirtyPayload,

    getFieldProps,

    resetField,
    resetAll,
    syncWithServer,
  };
}
