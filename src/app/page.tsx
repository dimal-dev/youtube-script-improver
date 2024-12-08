'use server'
import prisma from '@/lib/db'
import Link from "next/link";
import {RootLayoutOverridable} from "@/app/layout";
import hei from '@/lib/test'

console.log(hei)


export default async function Home() {
    const scripts = await prisma.script.findMany()

    const scriptElementList = scripts.map(script => {
        return (
            <li key={script.id} className='py-2'>
                <Link href={`/script/${script.id}`} className='underline text-blue-500 hover:text-blue-700'>
                    [{script.id}] {script.title}
                </Link>
            </li>
        );
    })

    return (
        <RootLayoutOverridable pageName='Main page'>
            <div>
                <ul className='text-center pt-4'>
                    {scriptElementList}
                </ul>
            </div>
        </RootLayoutOverridable>
    );
}
