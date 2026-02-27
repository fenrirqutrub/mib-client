import { Link } from "react-router";

import Social from "./Social";

const Contact = () => {
  return (
    <footer className=" ">
      <div className="flex justify-center flex-col gap-[30px]  ">
        <div>
          <h2
            className={`pacifico font-extrabold tracking-[10px] text-3xl md:text-5xl  text-center mt-10 text-text `}
          >
            Contact Us
          </h2>
        </div>

        <div className="flex items-end justify-center ">
          <Social />
        </div>

        <div className="border-t  border-[oklch(70.7% 0.022 261.325)] py-[20px] flex items-center w-full flex-wrap gap-[20px] justify-center rubik">
          <p className="text-[0.8rem] sm:text-[0.9rem] text-[var(--color-gray)] py-0 rubik-regular">
            &copy; 2021 All Rights Reserved by{" "}
            <Link to="/admin-login" className="pacifico font-semibold">
              Masud ibn Belat
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
