import { RxReset } from "react-icons/rx";

export default function InputReset({ onClick }) {
  return (
    <button
      type="button"
      className="text-3xl text-blue-600 cursor-pointer"
      onClick={onClick}
    >
      <RxReset/>
    </button>
  );
}
