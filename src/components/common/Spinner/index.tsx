export const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className={`w-4 h-4 border-3 border-solid border-white-600 border-t-violet-600 rounded-full animate-spin`}></div>
    </div>
  );
};
