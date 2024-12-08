import {RootLayoutOverridable} from "@/app/layout";

export default function ScriptLayout({
                                         children,
                                     }: {
    children: React.ReactNode
}) {

    const headerActions = (
        <div>
            <button>Dupa 3</button>
            <button>Dupa 4</button>
        </div>
    );

    return <RootLayoutOverridable headerActions={headerActions} pageName='Add script'>
        {children}
    </RootLayoutOverridable>
}