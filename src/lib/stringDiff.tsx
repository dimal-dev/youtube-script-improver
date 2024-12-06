import DiffMatchPatch from "diff-match-patch";

const dmp = new DiffMatchPatch();

export function stringDiff(str1: string, str2: string) {
    const diff = dmp.diff_main(str1, str2);
    dmp.diff_cleanupSemantic(diff);

    return diff;
}

export default dmp;