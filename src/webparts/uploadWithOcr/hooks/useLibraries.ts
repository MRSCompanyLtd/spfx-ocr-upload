import { SPFI } from "@pnp/sp";
import { IContextInfo, IDocumentLibraryInformation } from "@pnp/sp/sites";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IFileAddResult } from "@pnp/sp/files";

interface IUseLibraryProps {
    sp: SPFI;
}

const useLibraries = ({ sp }: IUseLibraryProps) => {

    async function getLibraries(): Promise<IDocumentLibraryInformation[]> {
        try {
            const siteContext: IContextInfo = await sp.site.getContextInfo();
            const site: string = siteContext.SiteFullUrl;
            const libs: IDocumentLibraryInformation[] = await sp.site.getDocumentLibraries(site);

            return libs;
        }
        catch(e) {
            console.log(e);

            return [];
        }
    }

    async function uploadDocument(file: File, lib: string): Promise<IFileAddResult> {
        let result: IFileAddResult;
        const filePath = encodeURI(file.name + '.pdf');
        console.log(filePath);

        try {
            if (file.size < 10485761) {
                result = await sp.web.getFolderByServerRelativePath(lib).files.addUsingPath(filePath, file, { Overwrite: true });
            } else {
                result = await sp.web.getFolderByServerRelativePath(lib).files.addChunked(filePath, file, data => {
                    console.log(data);
                }, true);
            }

            return result;
        }
        catch(e) {
            console.log(e);

            return result;
        }
    }

    return { getLibraries, uploadDocument }
}

export default useLibraries;