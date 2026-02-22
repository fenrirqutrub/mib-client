import Lottie from "lottie-react";
import infinityDark from "../../../public/infinity-dark.json";
import infinityLight from "../../../public/infinity-light.json";
import { useTheme } from "../../context/ThemeProvider";

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader = ({ fullScreen = true }: LoaderProps) => {
  const { theme } = useTheme();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex justify-center items-center
        ${fullScreen ? "min-h-screen flex " : "py-10"}
      `}
    >
      <Lottie
        animationData={theme === "dark" ? infinityDark : infinityLight}
        loop={true}
        autoplay={true}
        style={{ width: 400, height: 400 }}
        className=" text-primary  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
      />
    </div>
  );
};

export default Loader;
