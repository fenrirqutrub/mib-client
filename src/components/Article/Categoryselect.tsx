import React, { useEffect, useState, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";
import type { Category } from "../../types/Article.types";

interface SelectedCategory {
  id: string;
  name: string;
}

interface CategorySelectProps {
  categories: Category[];
  selectedCategory: SelectedCategory | null;
  onSelectCategory: (category: SelectedCategory | null) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: SelectedCategory[] = [
    { id: "all", name: "All Categories" },
    ...categories.map((cat) => ({ id: cat._id, name: cat.name })),
  ];

  const filteredItems = options.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const isSelected = (item: SelectedCategory): boolean => {
    if (!selectedCategory && item.id === "all") return true;
    return selectedCategory?.id === item.id;
  };

  const toggleItem = (item: SelectedCategory): void => {
    if (item.id === "all") {
      onSelectCategory(null);
    } else {
      onSelectCategory(item);
    }
    setSearchValue("");
    setIsOpenDropdown(false);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
        setIsFocused(false);
      }
    };
    if (isOpenDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenDropdown]);

  useEffect(() => {
    if (!isOpenDropdown) setSearchValue("");
  }, [isOpenDropdown]);

  const displayValue = selectedCategory?.name || "All Categories";

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger button — ✅ h-12 matches SearchBar exactly */}
      <div
        onClick={() => {
          setIsOpenDropdown((prev) => !prev);
          setIsFocused((prev) => !prev);
        }}
        className={`relative flex items-center h-12 px-4 pr-10 rounded-xl border cursor-pointer
          transition-all duration-200 bg-[var(--color-bg)]
          ${
            isFocused || isOpenDropdown
              ? "border-emerald-400 dark:border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              : "border-slate-200 dark:border-slate-700 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
          }`}
      >
        {/* Show search input when open, display label when closed */}
        {isOpenDropdown ? (
          <input
            type="text"
            autoFocus
            placeholder="Filter categories..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm bg-transparent text-[var(--color-gray)] placeholder-[var(--color-gray)] outline-none"
          />
        ) : (
          <span
            className={`text-sm truncate ${
              selectedCategory
                ? "text-[var(--color-gray)] font-medium"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {displayValue}
          </span>
        )}

        {/* Arrow icon */}
        <IoIosArrowDown
          className={`absolute right-3 text-lg text-gray-400 dark:text-gray-500 pointer-events-none
            transition-transform duration-200 ${isOpenDropdown ? "rotate-180" : "rotate-0"}`}
        />

        {/* Floating label — mirrors SearchBar style */}
        {(isFocused || isOpenDropdown || selectedCategory) && (
          <div
            className="absolute -top-2.5 left-4 px-1.5 text-xs font-medium rounded
            bg-white dark:bg-[#0D0E14] text-emerald-600 dark:text-emerald-400"
          >
            Category
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpenDropdown && (
        <div
          className="absolute left-0 w-full mt-1.5 border border-slate-200 dark:border-slate-700
          rounded-xl bg-[var(--color-bg)] shadow-xl z-20 max-h-56 overflow-auto
          divide-y divide-slate-100 dark:divide-slate-800"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm
                transition-colors duration-150
                ${
                  isSelected(item)
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              role="option"
              aria-selected={isSelected(item)}
            >
              <IoCheckmark
                className={`text-base text-emerald-500 transition-all duration-200 shrink-0
                  ${isSelected(item) ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              />
              <span className="truncate">{item.name}</span>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-[var(--color-gray)] py-6">
              No category found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
