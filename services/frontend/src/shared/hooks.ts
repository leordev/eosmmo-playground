import { useState } from "react";

export const useFormInput = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (e: any) => setValue(e.target.value);
  const doClear = () => setValue("");

  return {
    value,
    onChange,
    doClear,
    setValue
  };
};
