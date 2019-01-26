import * as React from "react";

interface ReactProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
}

const InputText = (props: ReactProps) => (
  <div className="field">
    {props.label && <label className="label">{props.label}</label>}
    <div className="control">
      <input
        className="input"
        type="text"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
    </div>
  </div>
);

export default InputText;
