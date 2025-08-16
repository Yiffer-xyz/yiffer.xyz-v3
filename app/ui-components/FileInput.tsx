import { forwardRef } from 'react';

const FileInput = forwardRef(
  (
    props: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.Ref<HTMLInputElement>
  ) => {
    return (
      <label className="w-[180px]">
        <input
          type="file"
          ref={ref}
          className="text-sm text-grey-500 file:mr-5 file:py-1.5 file:px-10 file:w-[180px] file:transition-all file:duration-100
          file:rounded-sm file:border-0 file:text-md file:font-semibold file:text-white
          file:bg-blue-weak-200 file:hover:bg-blue-weak-100
          file:focus:bg-blue-weak-100 
          dark:file:bg-blue-strong-200 dark:file:hover:bg-blue-strong-100
          dark:file:focus:bg-blue-strong-100
          hover:file:cursor-pointer file:shadow-sm file:hover:file:shadow-md
          file:focus:file:shadow-md text-transparent w-fit"
          {...props}
        />
      </label>
    );
  }
);

FileInput.displayName = 'FileInput';

export default FileInput;
