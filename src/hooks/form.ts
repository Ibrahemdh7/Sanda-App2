import { useState } from 'react';

export const useForm = <T extends object>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  return { values, setValues };
};
