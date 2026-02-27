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
        className=" text-primary  w-64 h-64 "
      />
    </div>
  );
};

export default Loader;
