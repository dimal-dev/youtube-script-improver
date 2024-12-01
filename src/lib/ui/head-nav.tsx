'use client'
import {usePathname} from "next/navigation";
import Link from "next/link";
import CustomNavLink from "@/lib/ui/nav-link";

export default function HeadNav() {
    const pathname = usePathname();

    return (
        <div className='text-center p-2 border-b-2'>
            <CustomNavLink href="/add-script">
                Add Script
            </CustomNavLink>
        </div>
    );
}