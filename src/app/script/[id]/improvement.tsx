'use client'

import {stringDiff} from "@/lib/stringDiff";
import DiffMatchPatch from "diff-match-patch";
import Prisma from '@prisma/client'

const letters = [...(new Array(26)).keys()].map(index => String.fromCharCode(97 + index))

function applyNode(nodes: DiffMatchPatch.Diff[], applyNodeIndex: number) {
    let finalText = '';

    for (let index = 0; index < nodes.length; index++) {
        const [operation, content] = nodes[index];

        if (index === applyNodeIndex) {
            finalText += content;
            continue;
        }

        if (operation === DiffMatchPatch.DIFF_EQUAL) {
            finalText += content
            continue;
        }

        if (operation === DiffMatchPatch.DIFF_DELETE) {
            const nextNodeIndex = index + 1;
            if (nextNodeIndex === applyNodeIndex) {
                if (nextNodeIndex in nodes && nodes[nextNodeIndex][0] === DiffMatchPatch.DIFF_INSERT) {
                    continue;
                }
            }
            finalText += content
        }
    }

    return finalText;
}

export default function Improvement({original, letterNumber, improvement, setOriginalContent}: {
    original: string | null,
    letterNumber: number,
    improvement: Prisma.ScriptLineImprovement,
    setOriginalContent: (original: string) => void
}) {
    if (original === improvement.content) {
        return null;
    }

    let contentNodes = null;
    let acceptAll = null;
    if (original !== improvement.content) {
        const diff = stringDiff(original ?? '', improvement.content ?? '');
        acceptAll = <span className='mx-1 hover:cursor-pointer'
                          onClick={() => setOriginalContent(improvement.content ?? '')}> ✅</span>

        let i = 0;
        contentNodes = diff.map(((node, index) => {
            const [operation, content] = node;
            let operationClass = '';
            if (operation === DiffMatchPatch.DIFF_DELETE) {
                operationClass = 'bg-red-200 line-through hover:cursor-pointer hover:bg-red-300'
            } else if (operation === DiffMatchPatch.DIFF_INSERT) {
                operationClass = 'bg-green-200 underline hover:cursor-pointer hover:bg-green-300'
            }

            return (
                <span className={operationClass} key={i++} onClick={(e) => {
                    if (DiffMatchPatch.DIFF_EQUAL) return;
                    if (!e.metaKey) return;

                    const newContent = applyNode(diff, index);
                    setOriginalContent(newContent);
                }}>
                {content}
            </span>
            );
        }));
    } else {
        contentNodes = original;
        acceptAll = '🥑';
    }

    return (
        // <div key={improvement.id}>
        <div key={improvement.id} className='py-2'>
            {acceptAll} {letters[letterNumber++]}) ┋ {contentNodes}
        </div>
    )
}