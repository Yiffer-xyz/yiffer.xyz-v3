import { forwardRef } from 'react';

const FileInput = forwardRef(
  (
    props: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.Ref<HTMLInputElement>
  ) => {
    return (
      <label>
        <input
          type="file"
          ref={ref}
          className="text-sm text-grey-500 file:mr-5 file:py-3 file:px-10 file:transition-all file:duration-100
          file:rounded file:border-0 file:text-md file:font-semibold file:text-white
          file:bg-blue-weak-200 file:hover:bg-blue-weak-100
          file:focus:bg-blue-weak-100 
          file:dark:bg-blue-strong-200 file:dark:hover:bg-blue-strong-100
          file:dark:focus:bg-blue-strong-100
          hover:file:cursor-pointer file:shadow file:hover:file:shadow-md
          file:focus:file:shadow-md"
          {...props}
        />
      </label>
    );
  }
);

export default FileInput;
