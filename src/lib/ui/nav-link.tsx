'use client';

import {usePathname} from "next/navigation";
import Link from "next/link";

export default function CustomNavLink({href, children, ...props}: {
    href: string,
    children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    const pathname = usePathname();
    const activeClass = href === pathname ? 'text-green-600 bg-green-100 font-bold' : 'text-blue-500'
    if (!props.className) {
        props.className = ''
    }
    props.className += ' py-2 px-3 rounded underline ' + activeClass;

    // props.className = props

    return (
        <Link href={href} {...props}>
            {children}
        </Link>
    )
}