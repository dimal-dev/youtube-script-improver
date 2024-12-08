'use client'
import {useActionState} from 'react'
import addScriptHandler from "@/app/add-script/add-script-handler";
import notion from "@/lib/notion";

const pageId = '14bfadbb073f80b98752da66d0b66647';


export default function AddScriptPage() {
    const initialState: {
        message?: string
    } = {
        message: '',
    }
    const [state, formAction] = useActionState(addScriptHandler, initialState)

    return (
        <div className="py-6">
            <form className="max-w-sm mx-auto" action={formAction}>
                <div className="mb-5">
                    <label htmlFor="url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notion Page URL</label>
                    <input type="text" name="url" id="url"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Notion Page URL" required/>
                </div>
                <div className="mb-5">
                    <label htmlFor="blockId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notion Block ID</label>
                    <input type="text" name="blockId" id="blockId"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Notion Block ID"
                           required/>
                </div>
                <button type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add
                    Script
                </button>
            </form>
        </div>
    )
}