export const Spinner = ({size} : {size: number}) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className={`w-${size} h-${size} border-4 border-solid border-white-600 border-t-violet-600 rounded-full animate-spin`}></div>
    </div>
  );
};
