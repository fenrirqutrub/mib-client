import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  fullScreen?: boolean;
}

const Loading = ({ fullScreen = true }: LoaderProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex justify-center items-center
        ${fullScreen ? "min-h-screen flex " : "py-10"}
      `}
    >
      <LoaderCircle
        className="
          animate-spin
          text-primary
          w-8 h-8
          sm:w-10 sm:h-10
          md:w-12 md:h-12
          lg:w-14 lg:h-14
        "
      />
    </div>
  );
};

export default Loading;
