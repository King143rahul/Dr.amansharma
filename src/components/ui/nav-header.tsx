"use client";

import { Link, useLocation } from 'react-router-dom';

type NavItem = {
  name: string;
  href: string;
};

type NavHeaderProps = {
  items?: NavItem[];
};

const DEFAULT_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'Startup', href: '/startup' },
  { name: 'Teaching', href: '/teaching' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

function NavHeader({ items = DEFAULT_ITEMS }: NavHeaderProps) {
  const location = useLocation();

  return (
    <ul className="relative mx-auto flex w-fit rounded-full border-2 border-academic-accent bg-white p-1 shadow-sm">
      {items.map((item) => (
        <Tab
          key={item.href}
          item={item}
          isActive={location.pathname === item.href}
        />
      ))}
    </ul>
  );
}

const Tab = ({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) => {
  return (
    <li className="block cursor-pointer">
      <Link
        to={item.href}
        className={`block rounded-full px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors duration-200 md:px-5 md:py-3 md:text-base ${
          isActive
            ? 'bg-academic-brand text-white'
            : 'text-academic-accent hover:bg-academic-accent hover:text-white focus-visible:bg-academic-accent focus-visible:text-white'
        }`}
      >
        {item.name}
      </Link>
    </li>
  );
};

export default NavHeader;
